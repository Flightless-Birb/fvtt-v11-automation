try {
    if (args[0].macroPass == "preDamageApplication") {
        args[0].workflow.damageList.forEach(async d => {
            const tokenOrActor = await fromUuid(d.actorUuid);
            const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
            if (!MidiQOL.typeOrRace(actor).toLowerCase().includes("undead")) return;
            d.totalDamage = Math.floor(args[0].damageTotal / 2);
            d.appliedDamage = Math.max(actor.system.attributes.hp.value - actor.system.attributes.hp.max, 0 - d.totalDamage);
            d.tempDamage = 0;
            d.newTempHP = d.oldTempHP;
            d.hpDamage = d.appliedDamage;
            d.newHP = d.oldHP - d.appliedDamage;
        });
    }
} catch (err) {console.error("Negative Energy Flood Macro - ", err)}