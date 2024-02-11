try {
    if (args[0].tag == "TargetOnUse" && args[0].macroPass == "preTargetSave" && args[0].workflow.item && args[0].workflow.saveDetails && args[0].item.type == "spell" && ["fiend", "undead"].find(t => MidiQOL.typeOrRace(args[0].workflow.actor).toLowerCase().includes(t))) args[0].workflow.saveDetails.advantage = true;
} catch (err) {console.error("Holy Nimbus Macro - ", err)}