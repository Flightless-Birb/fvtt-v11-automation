// reaction=="isDamaged"&&workflow.damageDetail.find(d=>["acid","cold","fire","lightning","poison"].includes(d.type.toLowerCase()))

try {
    const lastArg = args[args.length - 1];
    if (lastArg.macroPass == "postActiveEffects") {
        const options = ["Acid", "Cold", "Fire", "Lightning", "Thunder"].filter(o => !lastArg.workflowOptions.damageDetail || lastArg.workflowOptions.damageDetail.map(d=>d.type.toLowerCase()).includes(o.toLowerCase()));
        const optionContent = options.map((o) => { return `<option value="${o}">${o}</option>` });
        let dialog = options.length == 1 ? options[0] : new Promise((resolve,) => {
            new Dialog({
                title: "Absorb Elements: Choose a Damage Type",
                content: `<div><label>Damage Types: </label><select name="types"}>${optionContent}</select></div>`,
                buttons: {
                    Confirm: {
                        label: "Confirm",
                        callback: () => {resolve($("[name=types]")[0].value)},
                    },
                    Cancel: {
                        label: "Cancel",
                        callback: () => {resolve(false)},
                    },
                },
                default: "Cancel",
                close: () => {resolve(false)}
            }).render(true);
        });
        let type = await dialog;
        if (!type) return;
        const effectData = {
            name: "Absorb Elements",
            icon: "icons/magic/lightning/orb-ball-spiral-blue.webp",
            changes: [{ key: "data.traits.dr.value", mode: 2, value: type.toLowerCase(), priority: 20 }, { key: "macro.execute", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.QcHqoOMLVPiDGO4B", priority: 20 }],
            disabled: false,
            duration: { rounds: 1 },
            flags: { dae: { specialDuration: ["turnStartSource"] }, "midi-qol": { absorbElements: { type: type.toLowerCase(), level: lastArg.spellLevel } } }
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: lastArg.actor.uuid, effects: [effectData] });
    } else if (args[0] == "off" && game?.combat?.current?.tokenId == lastArg.tokenId) {
        const type = lastArg.efData.flags["midi-qol"]?.absorbElements?.type;
        const level = lastArg.efData.flags["midi-qol"]?.absorbElements?.level;
        const effectData = {
            name: "Absorb Elements Damage Bonus",
            icon: "icons/magic/lightning/orb-ball-spiral-blue.webp",
            changes: [
                { key: "system.bonuses.mwak.attack", mode: 2, value: `${level}d6[${type}]`, priority: 20 },
                { key: "system.bonuses.msak.attack", mode: 2, value: `${level}d6[${type}]`, priority: 20 },
            ],
            disabled: false,
            duration: { turns: 1 },
            flags: { dae: { specialDuration: ["1Hit:mwak", "1Hit:msak"] } },
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: actor.uuid, effects: [effectData] });
    }
} catch (err) {console.error("Absorb Elements Macro - ", err)}