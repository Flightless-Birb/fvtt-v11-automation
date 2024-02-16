try {
    if (args[0].macroPass != "preTargeting" || args[0].item.type != "spell" || !args[0].item.system.school || (game.combat && game.combat.current.tokenId != args[0].tokenId) || !(((args[0].item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("wizard")) || (args[0].item.system.chatFlavor.toLowerCase().includes("wizard"))) || (!args[0].item.flags?.["tidy5e-sheet"]?.parentClass && !args[0].item.system.chatFlavor && ["prepared", "always"].includes(args[0].item.system?.preparation?.mode)))) return;
    const token = canvas.tokens.placeables.find(t => t.name.includes("Manifest Mind") && t.document.flags?.["midi-qol"]?.parentUuid == args[0].actor.uuid);
    const usesItem = args[0].actor.items.find(i => i.name == "Manifest Mind" && i.system.uses.value);
    if (!token || !usesItem) return;
    let dialog = new Promise((resolve) => {
        new Dialog({
            title: "Manifest Mind",
            content: `<p>Cast the spell from your Manifested Mind?</p>`,
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
    if (!useFeat || MidiQOL.checkRange(args[0].item, token, args[0].targets, false).result == "fail") return;
    const effectData = {
        changes: [{ key: `flags.midi-qol.range.${args[0].item.system.actionType}`, mode: 2, value: 9999, priority: 20 }],
        disabled: false,
        name: "Manifest Mind",
        icon: "icons/magic/symbols/rune-sigil-rough-white-teal.webp",
        duration: { seconds: 1 },
        flags: { dae: { specialDuration: ["endCombat", "1Spell"] } }
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    args[0].workflow.token = token;
    args[0].workflow.tokenId = token.id;
    args[0].workflow.tokenUuid = token.document.uuid;
    let updateHook = Hooks.on("midi-qol.preStart", async workflowNext => {
        if (workflowNext.item.uuid == args[0].item.uuid) {
            workflowNext.token = token;
            workflowNext.tokenId = token.id;
            workflowNext.tokenUuid = token.document.uuid;
            workflowNext.rangeDetails.attackingToken = token;
            await usesItem.update({ "system.uses.value": Math.max(0, usesItem.system.uses.value - 1) });
            Hooks.off("midi-qol.preStart", updateHook);
        }
    });
    let abortHook = Hooks.on("midi-qol.preTargeting", async workflowNext => {
        if (workflowNext.item.uuid == args[0].item.uuid) {
            Hooks.off("midi-qol.preStart", updateHook);
            Hooks.off("midi-qol.preTargeting", abortHook);
        }
    });
} catch (err) {console.error("Manifest Mind Macro - ", err)}