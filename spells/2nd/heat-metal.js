try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
    const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (lastArg.tag == "OnUse" && lastArg.macroPass == "postActiveEffects") {
        const damageType = args[0].workflow.newDefaultDamageType ?? args[0].workflow.defaultDamageType ?? "fire";
        const itemData = {
            name: "Reactivate Heat Metal",
            img: "icons/commodities/metal/ingot-stamped-steel.webp",
            type: "feat",
            system: {
                description: { value: "Choose a manufactured metal object, such as a metal weapon or a suit of heavy or medium metal armor, that you can see within range. You cause the object to glow red-hot. Any creature in physical contact with the object takes [[/damage formula=2d8 type=fire]] damage when you cast the spell. Until the spell ends, you can use a bonus action on each of your subsequent turns to cause this damage again." },
                activation: { type: "bonus", cost: 1 },
                actionType: "save",
                damage: { parts: [[`${lastArg.spellLevel}d8`, damageType]] },
                save: { ability: "con", dc: lastArg.actor.system.attributes.spelldc, scaling: "flat" }
            },
            flags: { midiProperties: { magicdam: true, magiceffect: true, saveDamage: "fulldam", bonusSaveDamage: "fulldam" }, "midi-qol": { itemCondition: `[...workflow.targets][0].actor?.effects?.find(e=>e.name.includes('Heat Metal Object')&&e.origin.includes('${args[0].actor.uuid}'))` } }
        }
        await actor.createEmbeddedDocuments("Item", [itemData]);
    } else if (args[0] == "off") {
        const items = actor.items.filter(i => i.name == "Reactivate Heat Metal" && i.type == "feat").map(i => i.id);
        if (items.length) await actor.deleteEmbeddedDocuments("Item", items);
    }
} catch (err)  {console.error("Heat Metal Macro - ", err)}