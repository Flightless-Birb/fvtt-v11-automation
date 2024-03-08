try {
    if (args[0].workflow.divineSmite) {
        let typeBonus = ["undead", "fiend"].find(t => MidiQOL.typeOrRace(args[0].targets[0]?.actor.uuid)?.toLowerCase().includes(t));
        let dice = Math.min(args[0].workflow.divineSmite + 1 + (typeBonus ? 1 : 0), 6);
        let diceMult = args[0].isCritical ? 2: 1;
        return { damageRoll: `${dice * diceMult}d8[radiant]`, damageType: "radiant", flavor: "Divine Smite" }
    }
    if (args[0].tag != "DamageBonus" || (!args[0].hitTargets.length && MidiQOL.configSettings().autoRollDamage == "always") || !["mwak"].includes(args[0].item.system.actionType) || (5 * Math.floor(MidiQOL.computeDistance(args[0].workflow.token, args[0].targets[0], false) / 5) > (args[0].item.system.properties.includes("rch") ? 10 : 5) + (args[0].actor.flags?.["midi-qol"]?.range?.mwak ?? 0))) return;
    let options = "";
    Object.keys(args[0].actor.system.spells).forEach(key => {
        if (key == "pact" && args[0].actor.system.spells.pact.value > 0) options += `<option id="${args[0].actor.system.spells.pact.level}" value="${key}">Pact Magic [Level ${args[0].actor.system.spells.pact.level}] (${args[0].actor.system.spells[key].value}/${args[0].actor.system.spells[key].max} Slots)</option>`;
        if (key != "pact" && args[0].actor.system.spells[key].value > 0) options += `<option id="${key.slice(-1)}" value="${key}">Level ${key.slice(-1)} (${args[0].actor.system.spells[key].value}/${args[0].actor.system.spells[key].max} Slots)</option>`;
    });
    if (options == "") return;
    let slot = await new Promise((resolve) => {
        new Dialog({
            title: "Divine Smite",
            content: `
            <form>
                <p>Expend a Spell Slot to use Divine Smite?</p>
                <div class="form-group">
                    <label><b>Spell Slot Level</b></label>
                    <div class="form-fields">
                        <select id="slot" name="slot-level">` + options + `</select>
                    </div>
                </div>
                <div class="form-group">
                    <label class="checkbox">
                    <input id="consume" type="checkbox" name="consumeCheckbox" checked/><b>Consume Spell Slot?</b></label>
                </div>
            </form>
            `,
            buttons: {
                confirm: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: () => {resolve({ level: $("#slot").find(":selected").attr("id"), type: $("#slot").find(":selected").val(), consume: $("#consume").is(":checked")})}
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
        spellUpdate[`system.spells.${slot.type}.value`] = Math.max(args[0].actor.system.spells[slot.type].value - 1, 0);
        args[0].actor.update(spellUpdate);
    }
    let typeBonus = ["undead", "fiend"].find(t => MidiQOL.typeOrRace(args[0].targets[0]?.actor.uuid)?.toLowerCase().includes(t));
    let dice = Math.min(+slot.level + 1 + (typeBonus ? 1 : 0), 6);
    let diceMult = args[0].isCritical ? 2: 1;
    args[0].workflow.divineSmite = +slot.level;
    return { damageRoll: `${dice * diceMult}d8[radiant]`, damageType: "radiant", flavor: "Divine Smite" }
} catch (err)  {console.error("Divine Smite Macro - ", err)}