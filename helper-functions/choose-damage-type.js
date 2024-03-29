try {
    if (args[0].macroPass != "preItemRoll") return;
    let options = Object.keys(CONFIG.DND5E.damageTypes).filter(t => args[0].item.system.description.value.toLowerCase().includes(t));
	let optionsContent = options.map((t) => { return `<option value="${t}">${t.charAt(0).toUpperCase() + t.toLowerCase().slice(1)}</option>` });  
    let content = `
    <div class="form-group">
        <label>Damage Types: </label>
        <select name="types"}>${optionsContent}</select>
    </div>
    `;
    let typeDialog = await new Promise((resolve) => {
        new Dialog({
            title: `${args[0].item.name}: Choose Damage Type`,
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
    let rollHook = Hooks.on("midi-qol.postDamageRollStarted", async workflowNext => { // update damage roll to use new damage type
        if (workflowNext.uuid == args[0].uuid) {
            let newDamageRolls = workflowNext.damageRolls;
            let newBonusDamageRolls = workflowNext.bonusDamageRolls;
            newDamageRolls.forEach(async r => {
                r.terms.forEach(t => { 
                    if (t.options.flavor && t.options.flavor.toLowerCase() != args[0].item.system.damage.parts[0][1].toLowerCase()) return;
                    t.formula.replace(t.options.flavor, type);
                    t.options.flavor = type;
					t.flavor = type;
                });
            });
            newBonusDamageRolls.forEach(async r => {
                r.terms.forEach(t => { 
                    if (t.options.flavor && t.options.flavor.toLowerCase() != args[0].item.system.damage.parts[0][1].toLowerCase()) return;
                    t.formula.replace(t.options.flavor, type);
                    t.options.flavor = type;
					t.flavor = type;
                });
            });
            if (newDamageRolls) await workflowNext.setDamageRolls(newDamageRolls);
            if (newBonusDamageRolls) await workflowNext.setBonusDamageRolls(newBonusDamageRolls);
        }
    });
    let createHook = Hooks.on("createActiveEffect", async (effect) => { // update effects to use new damage type
        if (effect.origin.includes(args[0].item.uuid) && effect.changes.find(c => options.find(o => c.value.toLowerCase().includes(o.toLowerCase())))) {
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
        if (workflowNext.item.uuid == args[0].item.uuid) {
            Hooks.off("midi-qol.preDamageRollStarted", rollHook);
            Hooks.off("createActiveEffect", createHook);
            Hooks.off("midi-qol.preItemRoll", abortHook);
        }
    });
} catch (err) {console.error("Choose Damage Type Macro - ", err)}