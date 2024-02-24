try {
    if (args[0].workflow.divineStrike) {
        let dice = args[0].actor?.classes?.cleric?.system?.levels > 13 ? 2 : 1;
        let diceMult = args[0].isCritical ? 2 : 1;
        let damageType = args[0].actor.flags["midi-qol"]?.divineStrike ?? "radiant";
        return { damageRoll: `${dice * diceMult}d8[${damageType}]`, type: damageType, flavor: "Divine Strikes" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].damageRoll || args[0].item.type != "weapon" || !["mwak", "rwak"].includes(args[0].item.system.actionType) || (game.combat && game.combat?.current?.tokenId != args[0].tokenId) || (game.combat && args[0].actor.effects.find(e => e.name == "Used Divine Strike" && !e.disabled))) return;
	let useFeat = true;
    if (game.combat) {
        let dialog = new Promise((resolve) => {
            new Dialog({
            title: "Divine Strike",
            content: `<p>Use Divine Strike to deal additional damage?</p>`,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: () => resolve(true)
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                    callback: () => {resolve(false)}
                }
            },
            default: "cancel",
            close: () => {resolve(false)}
            }).render(true);
        });
        useFeat = await dialog;
    }
    if (!useFeat) return;
    if (game.combat) {
        const effectData = {
            disabled: false,
            flags: { dae: { specialDuration: ["turnStart", "combatEnd"] } },
			icon: "icons/weapons/clubs/club-spiked-glowing.webp",
            name: "Used Divine Strike",
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    }
	let dice = args[0].actor?.classes?.cleric?.system?.levels > 13 ? 2 : 1;
    let diceMult = args[0].isCritical ? 2 : 1;
	let damageType = args[0].actor.flags["midi-qol"]?.divineStrike ?? "radiant";
	args[0].workflow.divineStrike = true;
    return { damageRoll: `${dice * diceMult}d8[${damageType}]`, type: damageType, flavor: "Divine Strikes" }
} catch (err) {console.error("Divine Strike Macro - ", err)}