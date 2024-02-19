// saveItems - semicolon separated
// itemArgs format - comma separated 
// saveAbility - i.e. saveAbility=str ABILITY TO USE FOR SAVE
// saveDC - i.e. saveDC=10 DC TO USE FOR SAVE
// isMagic - i.e., isMagic=true IS SAVE FOR A MAGIC EFFECT
// isSpell - i.e., isSpell=true IS SAVE FOR A SPELL
// killAnim - i.e., killAnim=true WHETHER TO KILL ITEM ANIMATION

try {
    if (args[0].macroPass != "preTargetDamageApplication" || args[0].workflow.saveOnDamaged?.includes(args[0].options.actor.uuid)) return;
    const saveItems = args[0].options.actor.flags["midi-qol"]?.saveOnDamaged?.replaceAll(" ", "")?.replaceAll("\n", "")?.split(";");
    saveItems.forEach(async s => {
        const saveItem = s?.split(",");
        if (saveItem?.length < 2) return;
        const saveAbility = saveItem.find(i => i?.includes("saveAbility="))?.replace("saveAbility=","");
        const saveDC = saveItem.find(i => i?.includes("saveDC="))?.replace("saveDC=","");
        const isMagicValue = saveItem.find(i => i?.includes("isMagic="))?.replace("isMagic=","");
        const isMagic = !isMagicValue || isMagicValue == "false" ? false : true;
        const isSpellValue = saveItem.find(i => i?.includes("isSpell="))?.replace("isSpell=","");
        const isSpell = !isSpellValue || isSpellValue == "false" ? false : true;
        const advantageValue = saveItem.find(i => i?.includes("advantage="))?.replace("advantage=","");
        const advantage = !advantageValue || advantageValue == "false" ? false : true;
        const disadvantageValue = saveItem.find(i => i?.includes("disadvantage="))?.replace("disadvantage=","");
        const disadvantage = !disadvantageValue || disadvantageValue == "false" ? false : true;
        const killAnimValue = saveItem.find(i => i?.includes("killAnim="))?.replace("killAnim=","");
        const killAnim = !killAnimValue || killAnimValue == "false" ? false : true;
        const sourceEffect = args[0].options.actor.effects.find(e => e.changes.find(c => c.value?.replaceAll(" ", "")?.replaceAll("\n", "")?.replaceAll(";", "") == s));
        const sourceActor = game.actors.get(sourceEffect.origin.match(/Actor\.(.*?)\./)[1]) ?? canvas.tokens.placeables.find(t => t.actor && t.actor.id == sourceEffect.origin.match(/Actor\.(.*?)\./)[1])?.actor;
        const itemName = sourceEffect ? sourceEffect.name : "Save";
        const itemImg = sourceEffect ? sourceEffect.icon : "icons/svg/explosion.svg";
        if (!saveAbility || !saveDC || isNaN(saveDC) || !sourceEffect) return console.error("Invalid Save On Damaged arguments:", "actor =", args[0].options.actor, "token =", args[0].options.token, "sourceEffect =", sourceEffect, "saveAbility =", saveAbility, "saveDC =", saveDC, "killAnim =", killAnim);
        let saveHook = Hooks.on("midi-qol.RollComplete", async workflowNext => {
            if (workflowNext.uuid === args[0].uuid && workflowNext.damageList.find(d => d.actorUuid == args[0].options.actor.uuid && (d.wasHit || MidiQOL.configSettings().autoRollDamage != "always")).hpDamage > 0) {
                await applySave(args[0].options.actor, args[0].options.token, sourceEffect, sourceActor, saveAbility, saveDC, isMagic, isSpell, itemName, itemImg, killAnim, advantage, disadvantage);
                Hooks.off("midi-qol.RollComplete", saveHook);
            }
        });
        let abortHook = Hooks.on("midi-qol.preItemRoll", async workflowComplete => {
            if (workflowComplete.uuid === args[0].uuid) {
                Hooks.off("midi-qol.RollComplete", saveHook);
                Hooks.off("midi-qol.preItemRoll", abortHook);
            }
        });
    });
    args[0].workflow.saveOnDamaged = args[0].workflow?.saveOnDamaged ? args[0].workflow.saveOnDamaged?.concat([args[0].options.actor.uuid]) : [args[0].options.actor.uuid];
} catch (err) {console.error("Save On Damaged Macro - ", err)}

async function applySave(actor, target, sourceEffect, sourceActor, saveAbility, saveDC, isMagic, isSpell, itemName, itemImg, killAnim) {
    const itemData = {
        name: itemName,
        img: itemImg,
        type: isSpell ? "spell" : "feat",
        system: {
            level: 0,
            activation: { type: "special" },
            target: { value: 1, type: "creature" },
            actionType: "save",
            save: { ability: saveAbility, dc: saveDC, scaling: "flat" }
        },
        flags: { autoanimations: { isEnabled: killAnim }, midiProperties: { magicdam: isMagic, magiceffect: isMagic } }
    }
    const item = new CONFIG.Item.documentClass(itemData, { parent: sourceActor ?? actor });
    const save = await MidiQOL.completeItemUse(item, {}, { showFullCard: true, createWorkflow: true, configureDialog: false, targetUuids: [target.document.uuid] });
    if (save.failedSaves.size) return;
    await MidiQOL.socket().executeAsGM("removeEffects", { actorUuid: actor.uuid, effects: [sourceEffect.id] });
}