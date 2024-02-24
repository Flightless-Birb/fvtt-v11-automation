try {
    if (args[0].macroPass != "preStart" || args[0].workflow.awakenedSpellbook || args[0].item.type != "spell" || !args[0].item.system.school || args[0].spellLevel == 0 || !["msak", "rsak", "save", "other"].includes(item.system.actionType) || !args[0].item.system.damage.parts.find(p => ["acid", "bludgeoning", "cold", "fire", "force", "lightning", "necrotic", "piercing", "poison", "psychic", "radiant", "slashing", "thunder"].includes(p[1].toLowerCase())) || !(((args[0].item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("wizard")) || (args[0].item.system.chatFlavor.toLowerCase().includes("wizard"))) || (!args[0].item.flags?.["tidy5e-sheet"]?.parentClass && !args[0].item.system.chatFlavor && ["prepared", "always"].includes(args[0].item.system?.preparation?.mode)))) return;
    let options = Object.keys(CONFIG.DND5E.damageTypes).filter(t => args[0].actor.items.find(i => i.type == "spell" && i.system.school && i.system.level == args[0].spellLevel && i.uuid != args[0].item.uuid && (((item.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("wizard")) || (item.system.chatFlavor.toLowerCase().includes("wizard"))) || (!item.flags?.["tidy5e-sheet"]?.parentClass && !item.system.chatFlavor && ["prepared", "always"].includes(item.system?.preparation?.mode))) && i.system.description.value.toLowerCase().includes(t.toLowerCase()))).map((t) => { return `<option value="${t}">${t.charAt(0).toUpperCase() + t.toLowerCase().slice(1)}</option>` });  
    if (!options.length) return;
    let content = `
    <div class="form-group">
        <label>Damage Types: </label>
        <select name="types"}>${options}</select>
    </div>
    `;
    let typeDialog = await new Promise((resolve) => {
        new Dialog({
            title:"Awakened Spellbook: Choose Damage Type",
            content: content,
            buttons: {
                Confirm: {
                    label: "Confirm",
                    icon: '<i class="fas fa-check"></i>',
                    callback: async () => {resolve($("[name=types]")[0].value)},
                },
            },
            default: "Cancel",
            close: () => {resolve($("[name=types]")[0].value)}
        }).render(true);
    });
    let type = await typeDialog;
    args[0].workflow.newDefaultDamageType = type;
    args[0].workflow.awakenedSpellbook = type;
    let rollHook = Hooks.on("midi-qol.postDamageRollStarted", async workflowNext => { // update damage roll to use new damage type
        if (workflowNext.uuid == args[0].uuid) {
            let newDamageRolls = workflowNext.damageRolls;
            let newBonusDamageRolls = workflowNext.bonusDamageRolls;
            newDamageRolls.forEach(async r => {
                r.terms.forEach(t => { 
                    t.formula.replace(t.options.flavor, type);
                    t.options.flavor = type;
                });
            });
            newBonusDamageRolls.forEach(async r => {
                r.terms.forEach(t => { 
                    if (t.options.flavor && t.options.flavor.toLowerCase() != args[0].item.system.damage.parts[0][1].toLowerCase()) return;
                    t.formula.replace(t.options.flavor, type);
                    t.options.flavor = type;
                });
            });
            if (newDamageRolls) await workflowNext.setDamageRolls(newDamageRolls);
            if (newBonusDamageRolls) await workflowNext.setBonusDamageRolls(newBonusDamageRolls);
        }
    });
    let createHook = Hooks.on("createActiveEffect", async (effect) => { // update effects to use new damage type
        if (effect.origin.includes(args[0].actor.uuid) && effect.changes.find(c => options.find(o => c.value.toLowerCase().includes(o.toLowerCase())))) {
            let effectHook = Hooks.on("midi-qol.RollComplete", async (workflowNext) => {
                if (args[0].item.uuid == workflowNext.item.uuid) {
                    let changes = [...effect.changes];
                    changes.forEach(c => options.forEach(o => c.value = c.value.replace(o.toLowerCase(), type.toLowerCase())));
                    await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: effect.parent.uuid, updates: [{ _id: effect._id, changes: changes }] });
                    Hooks.off("midi-qol.RollComplete", effectHook);
                }
            });
        }
    });
    let abortHook = Hooks.on("midi-qol.preItemRoll", async workflowNext => {
        if (workflowNext.uuid === args[0].uuid) {
            Hooks.off("midi-qol.preDamageRollStarted", rollHook);
            Hooks.off("createActiveEffect", createHook);
            Hooks.off("midi-qol.preItemRoll", abortHook);
        }
    });
} catch (err) {console.error("Choose Damage Type Macro - ", err)}