try {
    if (args[0].workflow.geniesVessel) {
        let damage = args[0].actor.system.attributes.prof;
        let damageType = args[0].actor.flags["midi-qol"]?.genieKind;
        if (!damage || !damageType) return;
        return { damageRoll: `${damage}[${damageType}]`, type: damageType, flavor: "Genie's Vessel" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always")  || !["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) || (game.combat && game.combat?.current?.tokenId != args[0].tokenId) || (game.combat && args[0].actor.effects.find(e => e.name == "Used Genie's Vessel" && disabled == false))) return;
	let useFeat = true;
    if (game.combat) {
        let dialog = new Promise((resolve) => {
            new Dialog({
            title: "Genie's Vessel",
            content: `<p>Use Genie's Vessel to deal additional damage?</p>`,
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
			icon: "icons/equipment/neck/pendant-bronze-gem-blue.webp",
            name: "Used Genie's Vessel",
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    }
	let damage = args[0].actor.system.attributes.prof;
    let damageType = args[0].actor.flags["midi-qol"]?.genieKind;
    if (!damage || !damageType) return;
	args[0].workflow.geniesVessel = true;
    return { damageRoll: `${damage}[${damageType}]`, type: damageType, flavor: "Genie's Vessel" }
} catch (err) {console.error("Genie's Vessel Macro - ", err)}