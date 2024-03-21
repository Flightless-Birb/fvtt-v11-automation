try {
    if (args[0].macroPass != "postActiveEffects") return;
	args[0].targets.forEach(async t => {
		if (!t.actor || !MidiQOL.typeOrRace(t.actor)) return;
		const conditions = [{ key: "Strength", value: "str" }, { key: "Dexterity", value: "dex" }, { key: "Constitution", value: "con" }, { key: "Charisma", value: "cha" }, { key: "Intelligence", value: "int" }, { key: "Wisdom", value: "wis" }];
		const conditionOptions = conditions.reduce((acc, target) => acc += `<option value="${target.value}">${target.key}</option>`, "");
		let dialog = new Promise((resolve) => {
			new Dialog({
			title: "Enhance Ability",
			content: `
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Choose an Ability to enhance.</p>
			</div>
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Targeting: </p>
				<img id="${t.id}" src="${t.texture.src ?? t.document.texture.src}" style="border: 0px; width 50px; height: 50px;">
			</div>
			<form style="padding-bottom: 10px">
				<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
					<label for="condition">Ability:</label><select id="condition">${conditionOptions}</select>
				</div>
			</form>
			<script>
				$("img").mouseover(function(e) {
					let targetToken = canvas.tokens.get(e.target.id);
					targetToken.hover = true;
					targetToken.refresh();
				});
				$("img").mouseout(function(e) {
					let targetToken = canvas.tokens.get(e.target.id);
					targetToken.hover = false;
					targetToken.refresh();
				});
			</script>
			`,
			buttons: {
				confirm: {
					icon: '<i class="fas fa-check"></i>',
					label: "Confirm",
					callback: () => resolve($("#condition")[0].value)
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
		let condition = await dialog;
		if (!condition) return;
        const effectData = {
			changes: [{ key: `flags.midi-qol.advantage.ability.check.${condition}`, mode: 0, value: "1", priority: 20 }],
			disabled: false,
			origin: args[0].item.uuid,
			name: args[0].item.name,
            icon: args[0].item.img,
			duration: { seconds: 3600 }
		}
        if (condition == "con") effectData.changes.push({ key: "macro.actorUpdate", mode: 0, value: `${t.actor.uuid} number '${args[0].damageTotal}' system.attributes.hp.temp '0'`, priority: 20 });
        if (condition == "str") effectData.changes.push({ key: "system.attributes.encumbrance.max", mode: 1, value: "2", priority: 20 });
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: t.actor.uuid, effects: [effectData] });
    });
} catch (err) {console.error("Enhance Ability Macro - ", err)}