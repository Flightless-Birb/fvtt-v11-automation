try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
    const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (actor.items.find(i => i.name.includes("Persistent Rage"))) return;
    if (lastArg.tag == "DamageBonus" && lastArg.item.system.actionType == "mwak" && (lastArg.item.system.ability == "str" || (!lastArg.item.system.ability && actor.system.abilities.str.mod > actor.system.abilities.dex.mod)) && !(5 * Math.floor(MidiQOL.computeDistance(lastArg.workflow.token, lastArg.targets[0], false) / 5) > (lastArg.item.system.properties.rch ? 10 : 5) + (actor.flags?.["midi-qol"]?.range?.mwak ?? 0))) {
        const damage = args[0].actor.system.scale?.barbarian?.rage ?? 2;
        return { damageRoll: `${damage}`, flavor: "Rage" }
    } if (lastArg.macroPass == "preAttackRoll" && game.combat && !actor.effects.find(e => e.name == "Rage (Has Attacked or Taken Damage)")) {
        const effectData = {
            name: "Rage (Has Attacked or Taken Damage)",
            icon: "icons/creatures/abilities/mouth-teeth-human.webp",
            disabled: false,
            flags: { dae: { specialDuration: ["combatEnd"] } },
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
    } else if (lastArg.macroPass == "isDamaged" && game.combat && !lastArg.options.actor.effects.find(e => e.name == "Rage (Has Attacked or Taken Damage)")) {
        const effectData = {
            name: "Rage (Has Attacked or Taken Damage)",
            icon: "icons/creatures/abilities/mouth-teeth-human.webp",
            disabled: false,
            flags: { dae: { specialDuration: ["combatEnd"] } },
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.options.actor.uuid, effects: [effectData] });
    } else if (args[0] == "on" && game.combat && !actor.effects.find(e => e.name == "Rage (Has Attacked or Taken Damage)")) {
        const effectData = {
            name: "Rage (Has Attacked or Taken Damage)",
            icon: "icons/creatures/abilities/mouth-teeth-human.webp",
            disabled: false,
            flags: { dae: { specialDuration: ["combatEnd"] } },
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
    } else if (args[0] == "each") {
        if (actor.effects.find(e => e.name == "Rage (Has Attacked or Taken Damage)")) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: lastArg.actorUuid, effects: actor.effects.filter(e => e.name == "Rage (Has Attacked or Taken Damage)").map(e => e.id) });
        } else if (actor.effects.find(e => e.name == "Rage")) {
            await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: lastArg.actorUuid, effects: actor.effects.filter(e => e.name == "Rage").map(e => e.id) });
        }
    }
} catch (err)  {console.error("Rage Macro - ", err)}