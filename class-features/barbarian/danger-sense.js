try {
    if (args[0].tag == "TargetOnUse" && args[0].macroPass == "preTargetSave" && args[0].workflow.item && args[0].workflow.saveDetails && args[0].workflow.item.system?.save?.ability == "dex" && !MidiQOL.checkIncapacitated(args[0].actor)) args[0].workflow.saveDetails.advantage = true;
} catch (err) {console.error("Danger Sense Macro - ", err)}