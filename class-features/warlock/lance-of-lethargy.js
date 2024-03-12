try {
    if (args[0].tag === "OnUse" && args[0].macroPass == "postActiveEffects" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].damageRolls && args[0].item.name.includes("Eldritch Blast") && !args[0].actor.effects.find(e => e.name == "Used Lance of Lethargy" && !e.disabled) && (!game.combat || game.combat?.current.tokenId == args[0].tokenId)) {
        new Dialog({
            title: "Lance of Lethargy",
            content: "<p>Use Lance of Lethargy?</p>",
            buttons: {
                Confirm: {
                    label: "Confirm",
                    callback: async () => {
                        if (game.combat) {
                            const effectData = {
                                disabled: false,
                                duration: { rounds: 1 },
                                flags: { dae: { specialDuration: ["turnStart"] } },
                                name: "Used Lance of Lethargy",
                            }
                            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
                        }
                        const effectData = {
                            disabled: false,
                            duration: { rounds: 1, turns: 1 },
                            changes: [{key: "system.attributes.movement.all", mode: 0, value: "-10", priority: 20}],
                            name: "Lance of Lethargy",
                            icon: "icons/magic/unholy/beam-impact-green.webp"
                        }
                        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].hitTargets[0].actor.uuid, effects: [effectData] });
                    }
                },
                cancel: {
                    label: "Cancel",
                }
            }
        }).render(true);
    }
} catch (err) {console.error("Lance of Lethargy Macro - ", err)}