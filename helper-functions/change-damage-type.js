let options = [];
args[0].workflow.newDefaultDamageType = type;
let rollHook = Hooks.on("midi-qol.preDamageRollStarted", async workflowNext => {
    if (workflowNext.uuid === args[0].uuid && workflowNext.newDefaultDamageType) {
        workflowNext.defaultDamageType = type;
        let newDamageRoll = workflowNext.damageRoll;
        newDamageRoll.terms.forEach(t => { 
            t.formula.replace(t.options.flavor, type);
            t.options.flavor = type;
        });
        await args[0].workflow.setDamageRoll(newDamageRoll);
        Hooks.off("midi-qol.preDamageRollStarted", rollHook);
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
let abortHook = Hooks.on("midi-qol.preTargeting", async workflowNext => {
    if (workflowNext.uuid === args[0].uuid) {
        Hooks.off("midi-qol.preDamageRollStarted", rollHook);
        Hooks.off("createActiveEffect", createHook);
        Hooks.off("midi-qol.preTargeting", abortHook);
    }
});