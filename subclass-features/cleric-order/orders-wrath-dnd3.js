try {
    if (args[0].macroPass == "postActiveEffects" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].targets.length && ["mwak", "rwak"].includes(args[0].item.system.actionType) && (args[0].workflow.divineStrike || args[0].workflow.blessedStrikes)) {
        const effectData = {
            disabled: false,
            duration: { rounds: 1, seconds: 7 },
            changes: [{ key: "flags.midi-qol.onUseMacroName", mode: 0, value: "Compendium.dnd-5e-core-compendium.macros.boLeL2Q4CZvRZ69a, isAttacked", priority: "20" }],
            flags: { dae: { specialDuration: ["turnStartSource"] } },
            name: "Order's Wrath Damage Bonus",
            icon: "icons/magic/light/beam-deflect-path-yellow.webp"
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targets[0].actor.uuid, effects: [effectData] });
    } else if (args[0].macroPass == "isAttacked" && args[0].hitTargets.length && ["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType)) {
        args[0].workflow.ordersWrath = true
        let damageHook = Hooks.on("midi-qol.preDamageRollStarted", async workflowNext => {
            if (workflowNext.uuid == args[0].uuid && args[0].workflow.ordersWrath && workflowNext.damageRolls && workflowNext.targets.size) {
                let newDamageRolls = workflowNext.damageRolls;
                let diceMult = workflowNext.isCritical ? 2 : 1;
                let bonusRoll = await new Roll('0 + ' + `${2 * diceMult}d8[psychic]`).evaluate({async: true});
                for (let i = 1; i < bonusRoll.terms.length; i++) {
                    newDamageRolls[0].terms.push(bonusRoll.terms[i]);
                }
                newDamageRolls[0]._formula = newDamageRolls._formula + ' + ' + `${2 * diceMult}d8[psychic]`;
                newDamageRolls[0]._total = newDamageRolls.total + bonusRoll.total;
                await workflowNext.setDamageRolls(newDamageRolls);
                let effect = [...workflowNext.targets][0].actor.effects.find(e => e.name == "Order's Wrath Damage Bonus");
                if (effect) await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: [...workflowNext.targets][0].actor.uuid, effects: [effect.id] });
                Hooks.off("midi-qol.preDamageRollStarted", damageHook);
            }
        });
        let abortHook = Hooks.on("midi-qol.preItemRoll", async workflowNext => {
            if (workflowNext.uuid === args[0].uuid) {
                Hooks.off("midi-qol.preDamageRollStarted", damageHook);
                Hooks.off("midi-qol.preItemRoll", abortHook);
            }
        });
    }
} catch (err) {console.error("Order's Wrath Macro - ", err)}