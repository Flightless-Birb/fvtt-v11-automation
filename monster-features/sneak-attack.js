try {
    if (args[0].workflow.sneakAttack) {
        const dice = +args[0].actor.flags["midi-qol"].sneakAttack ?? 1;
        const diceMult = args[0].isCritical ? 2 : 1;
        return { damageRoll: `${dice * diceMult}d6`, flavor: "Sneak Attack" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !["mwak", "rwak"].includes(args[0].item.system.actionType) || args[0].disadvantage || (game.combat && args[0].actor.effects.find(e => e.label === "Used Sneak Attack")) || !(args[0].advantage || canvas.tokens.placeables.find(t=> t.actor && !((t.actor.system.details?.type?.value === "custom" || t.actor.system.details?.type?.value === "") && t.actor.system.details?.type?.custom === "") && t.id !== args[0].workflow.token.id && t.id !== args[0].targets[0].id && t.disposition === args[0].workflow.token.disposition && t.actor.system.attributes?.hp.value > 0 && !MidiQOL.checkIncapacitated(t.actor) && MidiQOL.computeDistance(t, args[0].targets[0], false) < 10))) return;
    if (game.combat) {
        const effectData = {
            disabled: false,
            duration: { turns: 1 },
            label: "Used Sneak Attack",
            icon: "icons/skills/melee/strike-dagger-arcane-pink.webp"
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    }
    const dice = +args[0].actor.flags["midi-qol"].sneakAttack ?? 1;
    const diceMult = args[0].isCritical ? 2 : 1;
    args[0].workflow.sneakAttack = true;
    return { damageRoll: `${dice * diceMult}d6`, flavor: "Sneak Attack" }
} catch (err) {console.error("Sneak Attack Macro - ", err)}