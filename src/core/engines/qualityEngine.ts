import { Project, QualityReport, QualityIssue } from '../../types/lilo';

// ============================================================
//  Quality Control Engine — Automated Continuity & Production QC
// ============================================================

export function runQualityControlChecks(project: Project): QualityReport {
  const issues: QualityIssue[] = [];
  let passedChecks = 0;
  let totalChecks = 0;

  project.scenes.forEach((scene) => {
    // Check 1: Characters present in scene exist in project
    totalChecks++;
    const missingChars = scene.characterIds.filter(
      id => !project.characters.some(c => c.id === id)
    );
    if (missingChars.length > 0) {
      issues.push({
        id: `qc_${scene.id}_char_missing`,
        sceneId: scene.id,
        type: 'character-mismatch',
        severity: 'high',
        title: `Unknown Character Reference in Scene ${scene.sceneNumber}`,
        message: `Scene references characters that are not in your Character Studio.`,
        suggestedFix: `Add the character to Character Studio or update scene casting.`,
        isResolved: false,
      });
    } else {
      passedChecks++;
    }

    // Check 2: Location exists in Location Studio
    totalChecks++;
    const locExists = project.locations.some(l => l.id === scene.locationId);
    if (!locExists) {
      issues.push({
        id: `qc_${scene.id}_loc_missing`,
        sceneId: scene.id,
        type: 'location-mismatch',
        severity: 'medium',
        title: `Unregistered Location in Scene ${scene.sceneNumber}`,
        message: `Scene references location ID "${scene.locationId}" which lacks Location DNA.`,
        suggestedFix: `Select an approved location from your Location Studio.`,
        isResolved: false,
      });
    } else {
      passedChecks++;
    }

    // Check 3: Dialogue timing & duration
    totalChecks++;
    const totalDialogueTime = scene.dialogues.reduce((sum, d) => sum + d.duration, 0);
    if (totalDialogueTime > scene.duration) {
      issues.push({
        id: `qc_${scene.id}_timing_overflow`,
        sceneId: scene.id,
        type: 'timing-gap',
        severity: 'medium',
        title: `Dialogue Exceeds Scene Duration in Scene ${scene.sceneNumber}`,
        message: `Total dialogue speech time (${Math.round(totalDialogueTime)}s) is longer than scene duration (${scene.duration}s).`,
        suggestedFix: `Extend scene duration to ${Math.round(totalDialogueTime + 2)}s or condense dialogue text.`,
        isResolved: false,
      });
    } else {
      passedChecks++;
    }

    // Check 4: Continuity across scene transitions
    totalChecks++;
    if (scene.sceneNumber > 1) {
      const prevScene = project.scenes[scene.sceneNumber - 2];
      if (prevScene && prevScene.weather !== scene.weather && scene.transition === 'cut') {
        issues.push({
          id: `qc_${scene.id}_abrupt_weather`,
          sceneId: scene.id,
          type: 'continuity-break',
          severity: 'low',
          title: `Abrupt Weather Shift in Scene ${scene.sceneNumber}`,
          message: `Weather suddenly changes from "${prevScene.weather}" to "${scene.weather}" across an instant cut.`,
          suggestedFix: `Use a Dissolve transition or maintain consistent weather.`,
          isResolved: false,
        });
      } else {
        passedChecks++;
      }
    } else {
      passedChecks++;
    }
  });

  const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;

  return {
    overallScore,
    passedChecks,
    totalChecks,
    issues,
  };
}
