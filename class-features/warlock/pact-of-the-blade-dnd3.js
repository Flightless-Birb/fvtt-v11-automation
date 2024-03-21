try {
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
	let actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    if (args[0] == "on") {
		if (lastArg.efData.changes.find(c => c.key == "flags.dae.deleteUuid")) return;
        const pack = await game.packs.get("dnd5e.items");
        let hexWarrior = actor.items.find(i => i.name == "Hex Warrior") ? true : false;
        let improved = actor.items.find(i => i.name == "Invocation: Improved Pact Weapon") ? true : false;
		let weapons = pack.index.contents.filter(i => ["Club", "Dagger", "Greatclub", "Handaxe", "Javelin", "Light Hammer", "Mace", "Quarterstaff", "Sickle", "Spear", "Battleaxe", "Flail", "Glaive", "Greataxe", "Greatsword", "Halberd", "Lance", "Longsword", "Maul", "Morningstar", "Pike", "Rapier", "Scimitar", "Shortsword", "Trident", "War Pick", "Warhammer", "Whip"].includes(i.name) || (improved && ["Shortbow", "Longbow", "Light Crossbow", "Heavy Crossbow"].includes(i.name)));
        const weaponContents = weapons.reduce((acc, target) => acc += `<option value="${target._id}">${target.name}</option>`, "");
        const content = `<p>Pick a Weapon:</p><form><div class="form-group"><label for="weapon">Weapon:</label><select id="weapon">${weaponContents}</select></div></form>`;
        new Dialog({
            title: "Pact of the Blade",
            content,
            buttons: {
                confirm: {
                    label: "Confirm",
                    callback: async () => {
                        let itemId = $("#weapon")[0].value;
                        if (!itemId) return ui.notifications.warn("No Weapon Selected");
                        let weaponItem = (await pack.getDocument(itemId))?.toObject();
                        let copyItem = duplicate(weaponItem);
                        if (improved) {
                            copyItem.system.attackBonus = 1;
                            copyItem.system.damage.parts[0][0] += " + 1"
                            if (copyItem.system.damage.versatile != "" && copyItem.system.damage.versatile != null) copyItem.system.damage.versatile += " + 1";
                        }
                        if (hexWarrior) copyItem.system.ability = "cha";
                        copyItem.name = copyItem.name + " (Pact Weapon)";
                        copyItem.system.properties = Array.from(new Set([...copyItem.system.properties].concat(["mgc"])));
                        copyItem.system.equipped = true;
                        copyItem.system.proficient = true;
                        copyItem.flags.pactOfTheBlade = lastArg.efData._id;
                        await actor.createEmbeddedDocuments("Item", [copyItem]);
                    }
                },
                cancel: {
                    label: "Cancel",
                },
            },
            default: "cancel",
        }).render(true);
    } else if (args[0] == "off") {
        let weapon = actor.items.find(i => i.flags.pactOfTheBlade == lastArg.efData._id);
        if (!weapon) {
            actor = game.actors.contents.find(a => a.items.find(i => i.flags.pactOfTheBlade == lastArg.efData._id));
            if (actor) weapon = actor.items.find(i => i.flags.pactOfTheBlade == lastArg.efData._id);
        }
        if (actor && weapon) await actor.deleteEmbeddedDocuments("Item", [weapon.id])
    }
} catch (err) {console.error("Pact of the Blade Macro - ", err);}