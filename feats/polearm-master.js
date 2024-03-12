try {
	if (args[0].tag != "OnUse" || args[0].macroPass != "postActiveEffects") return;
	const weapons = args[0].actor.items.filter((i) => i.type == "weapon" && i.system.equipped && ["glaive", "halberd", "pike", "quarterstaff", "spear"].includes(i.system.type.baseItem));
    let weapon_content = "";
    weapons.forEach((weapon) => { weapon_content += `<label class="radio-label"><input type="radio" name="weapon" value="${weapon.id}"><img src="${weapon.img}" style="border:0px; width: 50px; height:50px;">${weapon.name}</label>`; });
    let content = `
        <style>
        .weapon .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
        .weapon .radio-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
        .weapon .radio-label input { display: none; }
        .weapon img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
        .weapon [type=radio]:checked + img { outline: 2px solid #f00; }
        </style>
        <form class="weapon">
        <div class="form-group" id="weapons">
            ${weapon_content}
        </div>
        </form>
    `;
    let dialog = weapons.length == 1 ? weapons[0].id : new Promise((resolve,) => {
        new Dialog({
            title: "Polearm Master: Choose a weapon",
            content,
            buttons: {
                Ok: {
                    label: "Confirm",
                    callback: async () => {resolve($("input[type='radio'][name='weapon']:checked").val())},
                },
                Cancel: {
                    label: "Cancel",
                    callback: () => {resolve(false)},
                },
            },
            default: "Cancel",
            close: () => {resolve(false)}
        }).render(true);
    });
    let weaponId = await dialog;
    if (!weaponId) return;
    const weapon = args[0].actor.items.find(i => i.id == weaponId);
    const weaponCopy = await mergeObject(duplicate(weapon), { "_id": null, "system.damage.versatile": "" });
    const parts = weaponCopy.system.damage.parts;
    parts[0][0] = parts[0][0].replace(/d(6|8|10|12)/, "d4"); 
    parts[0][1] = "bludgeoning";
    const attackItem = await new CONFIG.Item.documentClass(weaponCopy, { parent: args[0].actor });
    attackItem.system.prof = weapon.system.prof;
    await MidiQOL.completeItemRoll(attackItem, {}, { showFullCard: true, createWorkflow: true, configureDialog: false, targetUuids: [args[0].targetUuids[0]] });
} catch (err) {console.error("Polearm Master Macro - ", err)}