try {
    if (args[0].workflow.eldritchSmite) {
        let dice = args[0].workflow.eldritchSmite + 1;
        let diceMult = args[0].isCritical ? 2: 1;
        return { damageRoll: `${dice * diceMult}d8[force]`, damageType: "force", flavor: "Eldritch Smite" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].item.name.includes("(Pact Weapon)") || args[0].actor.system.spells.pact.value < 1 || args[0].actor.effects.find(e => e.name == "Used Eldritch Smite")) return;
    let slot = await new Promise((resolve) => {
        new Dialog({
            title: "Eldritch Smite",
            content: `
            <form id="spell-use-form">
                <p>Use Eldritch Smite?</p>
                <div class="form-group">
                    <label class="checkbox">
                    <input id="consume" type="checkbox" name="consumeCheckbox" checked/>` + game.i18n.localize("DND5E.SpellCastConsume") + `</label>
                </div>
            </form>
            `,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: () => {resolve({consume: $("#consume").is(":checked")})}
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
    if (!slot) return;
    if (slot.consume) {
        let spellUpdate = new Object();
        spellUpdate[`system.spells.pact.value`] = Math.max(args[0].actor.system.spells.pact.value - 1, 0);
        args[0].actor.update(spellUpdate);
    }
    if (game.combat) {
        let effectData = {
            disabled: false,
            duration: { turns: 1 },
            name: "Used Eldritch Smite",
        }
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
    }
    if (args[0].targets[0]?.actor?.system.details.size != "grg" && !args[0].targets[0]?.actor?.effects.find(e => e.name === "Prone") && !(args[0].targets[0]?.actor?.system?.traits?.ci?.value?.has("prone") || args[0].targets[0]?.actor?.system?.traits?.ci?.custom?.toLowerCase()?.includes("prone"))) {
        let effectData = {
            disabled: false,
            changes: [{key: "StatusEffect", mode: 0, value: "Convenient Effect: Prone", priority: 20}],
            name: "Prone"
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targets[0].actor.uuid, effects: [effectData] });
    }
    let dice = args[0].actor.system.spells.pact.level + 1;
    let diceMult = args[0].isCritical ? 2 : 1;
    args[0].workflow.eldritchSmite = +args[0].actor.system.spells.pact.level;
    return { damageRoll: `${dice * diceMult}d8[force]`, damageType: "force", flavor: "Eldritch Smite" }
} catch (err) {console.error("Eldritch Smite Macro - ", err)}