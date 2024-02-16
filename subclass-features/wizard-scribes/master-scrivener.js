try {
    if (args[0].macroPass != "postActiveEffects") return;
    const spells = args[0].actor.items.filter(i => i.type == "spell" && i.system.school && i.system.level > 0 && i.system.level < 3 && i.system.activation && ["prepared", "always"].includes(i.system?.preparation?.mode) && (((i.flags?.["tidy5e-sheet"]?.parentClass.toLowerCase().includes("wizard")) || (i.system.chatFlavor.toLowerCase().includes("wizard"))) || (!i.flags?.["tidy5e-sheet"]?.parentClass && !i.system.chatFlavor && ["prepared", "always"].includes(i.system?.preparation?.mode))));
    let spellContent = "";
    spells.forEach((spell) => { spellContent += `<label class="radio-label"><input type="radio" name="spell" value="${spell.id}"><img src="${spell.img}" style="border:0px; width: 50px; height:50px;">${spell.name}</label>`; });
    if (spellContent == "") return;
    const content = `
        <style>
        .spell .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
        .spell .radio-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
        .spell .radio-label input { display: none; }
        .spell img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
        .spell [type=radio]:checked + img { outline: 2px solid #f00; }
        </style>
        <form class="spell">
        <div class="form-group" id="spells">
            ${spellContent}
        </div>
        </form>
    `;
    let dialog = new Promise((resolve) => {
        new Dialog({
            title: "Master Scrivener: Choose a Spell",
            content,
            buttons: {
                confirm: { 
                    icon: '<i class="fas fa-check"></i>',
                    label: "Confirm",
                    callback: async () => {resolve($("input[type='radio'][name='spell']:checked").val())}
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
    let spellId = await dialog;
    if (!spellId) return;
    let spell = args[0].actor.items.get(spellId);
    let spellCopy = mergeObject(duplicate(spell.toObject(false)), 
    { name: spell.name + " (Master Scrivener)", flags: { "midi-qol": { masterScrivener: true } },  system: { level: spell.system.level + 1, preparation: { mode: "atwill" }, components: { material: false, somatic: false, vocal: false, ritual: false }, materials: { value: "", consumed: false, cost: 0, supply: 0 }, uses: { value: 1, max: 1, per: "charges" } } }, 
    { overwrite: true, inlace: true, insertKeys: true, insertValues: true });
    if (spellCopy.system.damage.parts.length && spellCopy.system.scaling.mode == "level" && spellCopy.system.scaling.formula) spellCopy.system.damage.parts[0][0] = spellCopy.system.damage.parts[0][0] + " + " + spellCopy.system.scaling.formula;
    await args[0].actor.createEmbeddedDocuments("Item", [spellCopy]);
    let item = args[0].actor.items.find(i => i.name == spellCopy.name);
    const effectData = {
        changes: [{ key: "flags.dae.deleteUuid", mode: 5, value: item.uuid, priority: 20 }],
        origin: args[0].item.uuid,
        disabled: false,
        name: "Master Scrivener",
        icon: "icons/sundries/scrolls/scroll-bound-sealed-blue.webp",
        flags: { dae: { specialDuration: ["longRest"] } }
    };
    await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
} catch (err) {console.error("Master Scrivener Macro - ", err)}