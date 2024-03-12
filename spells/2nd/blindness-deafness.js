try {
    if (args[0].macroPass != "postActiveEffects") return;
	const targets = args[0].failedSaves;
	if (!targets.length) return;
    targets.forEach(async t => {
		if (!t.actor || !MidiQOL.typeOrRace(t.actor)) return;
		const conditionOptions = ["Blinded", "Deafened"].reduce((acc, target) => acc += `<option value="${target}">${target}</option>`, "");
		let dialog = new Promise((resolve) => {
			new Dialog({
			title: "Blindness/Deafness",
			content: `
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Choose a Condition to apply.</p>
			</div>
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Targeting: </p>
				<img id="${t.id}" src="${t.texture.src ?? t.document.texture.src}" style="border: 0px; width 50px; height: 50px;">
			</div>
			<form>
				<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
					<label for="condition">Condition:</label><select id="condition">${conditionOptions}</select>
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
        if (t?.actor?.system?.traits?.ci?.value?.has(condition.toLowerCase()) || t?.actor?.system?.traits?.ci?.custom?.toLowerCase()?.includes(condition.toLowerCase())) return;
        const effectData = {
			changes: [{ key: "macro.CE", mode: 0, value: condition, priority: 20 }, { key: "flags.midi-qol.OverTime", mode: 0, value: `turn=end,label=Blindness/Deafness (${condition}),saveAbility=con,saveDC=${args[0].actor.system.attributes.spelldc},saveMagic=true,killAnim=true`, priority: 20 }],
			disabled: false,
			origin: args[0].item.uuid,
			name: args[0].item.name,
            icon: args[0].item.img,
			duration: { seconds: 60 },
		}
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: t.actor.uuid, effects: [effectData] });
    });
} catch (err) {console.error("Blindness/Deafness Macro - ", err)}