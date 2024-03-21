try {
    if (args[0].macroPass != "preItemRoll" || args[0].item.type != "spell" || !["prepared", "always"].includes(args[0].item.system.preparation.mode)) return;
    let createHook = Hooks.on("refreshMeasuredTemplate", async (template) => {
        if (template?.document?.flags?.dnd5e.origin == args[0].workflow.item.uuid && args[0].workflow.castData.castLevel > args[0].workflow.castData.baseLevel) {
            let newDistance  = template.document.distance + (5 * (args[0].workflow.castData.castLevel - args[0].workflow.castData.baseLevel));
            template.document.distance = newDistance;
            template.document._source.distance = newDistance;
            Hooks.off("refreshMeasuredTemplate", createHook);
        }
    });
    let abortHook = Hooks.on("midi-qol.preItemRoll", async workflowNext => {
        if (workflowNext.uuid == args[0].uuid) {
            Hooks.off("refreshMeasuredTemplate", createHook);
            Hooks.off("midi-qol.preItemRoll", abortHook);
        }
    });
} catch (err) {console.error("Template Higher Level Area 5ft - ", err)}

try {
    if (args[0].macroPass != "preItemRoll" || args[0].item.type != "spell" || !["prepared", "always"].includes(args[0].item.system.preparation.mode)) return;
    let createHook = Hooks.on("refreshMeasuredTemplate", async (template) => {
        if (template?.document?.flags?.dnd5e.origin == args[0].workflow.item.uuid && args[0].workflow.castData.castLevel > args[0].workflow.castData.baseLevel) {
            let newDistance  = template.document.distance + (10 * (args[0].workflow.castData.castLevel - args[0].workflow.castData.baseLevel));
            template.document.distance = newDistance;
            template.document._source.distance = newDistance;
            Hooks.off("refreshMeasuredTemplate", createHook);
        }
    });
    let abortHook = Hooks.on("midi-qol.preItemRoll", async workflowNext => {
        if (workflowNext.uuid == args[0].uuid) {
            Hooks.off("refreshMeasuredTemplate", createHook);
            Hooks.off("midi-qol.preItemRoll", abortHook);
        }
    });
} catch (err) {console.error("Template Higher Level Area 10ft - ", err)}

try {
    if (args[0].macroPass != "preItemRoll" || args[0].item.type != "spell" || !["prepared", "always"].includes(args[0].item.system.preparation.mode)) return;
    let createHook = Hooks.on("refreshMeasuredTemplate", async (template) => {
        if (template?.document?.flags?.dnd5e.origin == args[0].workflow.item.uuid && args[0].workflow.castData.castLevel > args[0].workflow.castData.baseLevel) {
            let newDistance  = template.document.distance + (20 * (args[0].workflow.castData.castLevel - args[0].workflow.castData.baseLevel));
            template.document.distance = newDistance;
            template.document._source.distance = newDistance;
            Hooks.off("refreshMeasuredTemplate", createHook);
        }
    });
    let abortHook = Hooks.on("midi-qol.preItemRoll", async workflowNext => {
        if (workflowNext.uuid == args[0].uuid) {
            Hooks.off("refreshMeasuredTemplate", createHook);
            Hooks.off("midi-qol.preItemRoll", abortHook);
        }
    });
} catch (err) {console.error("Template Higher Level Area 20ft - ", err)}

/*
try {
    if (args[0].macroPass != "preItemRoll") return;
    let createHook = Hooks.on("refreshMeasuredTemplate", async (template) => {
        console.error("in", (template?.item?.uuid == args[0].workflow.item.uuid && args[0].workflow.castData.castLevel > args[0].workflow.castData.baseLevel))
        if (template?.item?.uuid == args[0].workflow.item.uuid && args[0].workflow.castData.castLevel > args[0].workflow.castData.baseLevel) {
            let oldDistance = template.document.distance;
            let newDistance  = template.document.distance + (10 * (args[0].workflow.castData.castLevel - args[0].workflow.castData.baseLevel));
            let distanceMult = (newDistance / oldDistance);
            template.document.distance = newDistance;
            template.document._source.distance = newDistance;
            //template.ray.distance = template.ray.distance * distanceMult;
            //template.ray.dx = template.ray.distance;
            //template.width = template.width * distanceMult;
            //template.height = template.height * distanceMult; 
            //template.sheet.options.width = template.sheet.options.width * distanceMult;
            //template.sheet.position.width = template.sheet.position.width * distanceMult;
            Hooks.off("refreshMeasuredTemplate", createHook);
        }
    });
    let abortHook = Hooks.on("midi-qol.preItemRoll", async workflowNext => {
        if (workflowNext.uuid == args[0].uuid) {
            Hooks.off("refreshMeasuredTemplate", createHook);
            Hooks.off("midi-qol.preItemRoll", abortHook);
        }
    });
} catch (err) {console.error("Higher Level Area Ten - ", err)}
*/