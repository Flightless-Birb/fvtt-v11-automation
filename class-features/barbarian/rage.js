try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
    const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (actor.items.find(i => i.name.includes("Persistent Rage"))) return;
    if (lastArg.macroPass == "preAttackRoll" && game.combat && !lastArg.actor.effects.find(e => e.name == "Rage (Has Attacked or Taken Damage)")) {
        const effectData = {
            name: "Rage (Has Attacked or Taken Damage)",
            icon: "icons/creatures/abilities/mouth-teeth-human.webp",
            disabled: false,
            flags: { dae: { specialDuration: ["combatEnd"] } },
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.actor.uuid, effects: [effectData] });
    } else if (lastArg.macroPass == "isDamaged" && game.combat && !lastArg.options.actor.effects.find(e => e.name == "Rage (Has Attacked or Taken Damage)")) {
        const effectData = {
            name: "Rage (Has Attacked or Taken Damage)",
            icon: "icons/creatures/abilities/mouth-teeth-human.webp",
            disabled: false,
            flags: { dae: { specialDuration: ["combatEnd"] } },
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.options.actor.uuid, effects: [effectData] });
    } else if (args[0] == "each") {
        if (actor.effects.find(e => e.name == "Rage (Has Attacked or Taken Damage)")) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: lastArg.actorUuid, effects: actor.effects.filter(e => e.name == "Rage (Has Attacked or Taken Damage)").map(e => e.id) });
        } else if (actor.effects.find(e => e.name == "Rage")) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: lastArg.actorUuid, effects: actor.effects.filter(e => e.name == "Rage").map(e => e.id) });
        }
    }
} catch (err)  {console.error("Rage Macro - ", err)}