try {
    if (args[0].macroPass == "preTargetSave" && args[0].workflow.item && args[0].workflow.saveDetails && args[0].workflow.item.type == "spell") args[0].workflow.saveDetails.advantage = true;
} catch (err) {console.error("Spell Resistance Macro - ", err)}