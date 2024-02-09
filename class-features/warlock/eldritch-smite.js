try {
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !args[0].damageRoll || !args[0].item.name.includes("(Pact Weapon)") || args[0].actor.system.spells.pact.value < 1 || args[0].actor.effects.find(e => e.name == "Used Eldritch Smite")) return;
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
    if (args[0].targets[0]?.actor?.system.details.size != "grg" && !args[0].targets[0]?.actor?.effects.find(e => e.name === "Prone")) {
        let effectData = {
            disabled: false,
            changes: [{key: "StatusEffect", mode: 0, value: "Convenient Effect: Prone", priority: 20}],
            name: "Prone"
        };
        await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].targets[0].actor.uuid, effects: [effectData] });
    }
    let dice = args[0].actor.system.spells.pact.level + 1;
    let diceMult = args[0].isCritical ? 2: 1;
    let bonusRoll = await new Roll('0 + ' + `${dice * diceMult}d8[force]`).evaluate({async: true});
    if (game.dice3d) game.dice3d.showForRoll(bonusRoll);
    for (let i = 1; i < bonusRoll.terms.length; i++) {
        args[0].damageRoll.terms.push(bonusRoll.terms[i]);
    }
    args[0].damageRoll._formula = args[0].damageRoll._formula + ' + ' + `${dice * diceMult}d8[force]`;
    args[0].damageRoll._total = args[0].damageRoll.total + bonusRoll.total;
	await args[0].workflow.setDamageRoll(args[0].damageRoll);
} catch (err) {console.error("Eldritch Smite Macro - ", err)}