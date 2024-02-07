try {
    if (args[0].tag == "OnUse" && args[0].macroPass == "preAttackRoll" && args[0].item.system.actionType == "mwak" && ["str", "", null].includes(args[0].item.system.ability)) args[0].workflow.advantage = true;
} catch (err) {console.error("Reckless Attack Macro - ", err)}