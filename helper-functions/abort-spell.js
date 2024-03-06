try {
    if (args[0].macroPass == "preTargeting" && args[0].item.type == "spell" && args[0].item.system.school) {
        ui.notifications.warn("Unable to cast Spells");
        return false;
    }
} catch (err)  {console.error("Abort Spell Macro - ", err)}