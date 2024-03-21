try {
    if (args[0].macroPass != "postActiveEffects") return;
    const targets = args[0].targets.find(t => t.actor && t.actor.uuid == args[0].actor.uuid) ? args[0].failedSaves.concat([args[0].targets.find(t => t.actor && t.actor.uuid == args[0].actor.uuid)]) : args[0].failedSaves;
	if (!targets.length) return;
    targets.forEach(async t => {
		if (!t.actor || !MidiQOL.typeOrRace(t.actor) || t.actor.system.traits.ci.custom.toLowerCase().includes("form altering")) return;
		const conditionOptions = ["Enlarge", "Reduce"].reduce((acc, target) => acc += `<option value="${target}">${target}</option>`, "");
		let dialog = new Promise((resolve) => {
			new Dialog({
			title: "Enlarge/Reduce",
			content: `
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Choose a Condition to apply.</p>
			</div>
			<div style="display: flex; flex-direction: row; align-items: center; text-align: center; justify-content: center;">
				<p>Targeting: </p>
				<img id="${t.id}" src="${t.texture.src ?? t.document.texture.src}" style="border: 0px; width 50px; height: 50px;">
			</div>
			<form style="padding-bottom: 10px">
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
		const sizeTypes = {
			grg: { Enlarge: "grg", Reduce: "huge" },
			huge: { Enlarge: "grg", Reduce: "lg" },
			lg: { Enlarge: "huge", Reduce: "med" },
			med: { Enlarge: "lg", Reduce: "sm" },
			sm: { Enlarge: "med", Reduce: "tiny" },
			tiny: { Enlarge: "sm", Reduce: "tiny" }
		}
		const sizeMults = {
			grg: 4,
			huge: 3,
			lg: 2,
			med: 1,
			sm: 1,
			tiny: 0.25
		}
		let originalSize = t.actor.system.traits.size;
		let changes = condition == "Enlarge" ? [{ key: "system.bonuses.mwak.damage", mode: 2, value: "+1d4", priority: 20 }, { key: "system.bonuses.rwak.damage", mode: 2, value: "+1d4", priority: 20 }] : [ { key: "system.bonuses.mwak.damage", mode: 2, value: "-1d4", priority: 20 }, { key: "system.bonuses.rwak.damage", mode: 2, value: "-1d4", priority: 20 }];
		changes = changes.concat([{ key: "system.traits.size", mode: 5, value: sizeTypes[originalSize][condition], priority: 20 }, { key: "ATL.height", mode: 5, value: sizeMults[sizeTypes[originalSize][condition]], priority: 20 }, { key: "ATL.width", mode: 5, value: sizeMults[sizeTypes[originalSize][condition]], priority: 20 }]);
		const effectData = {
			changes: changes,
			disabled: false,
			origin: args[0].item.uuid,
			name: args[0].item.name,
            icon: args[0].item.img,
			duration: { seconds: 60 },
		}
		await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: t.actor.uuid, effects: [effectData] });
    });
} catch (err) {console.error("Enlarge/Reduce Macro - ", err)}

/*
try {
    if (args[0].tag != "OnUse" || args[0].macroPass != "postActiveEffects" || !args[0].targets.find(t => t?.actor.effects.find(e => e.origin == args[0].item.uuid && !e.changes.find(e => e.key == "flags.dae.deleteUuid")))) return;
    let dialog = new Promise((resolve) => {
        new Dialog({
        title: "Usage Configuration: Enlarge/Reduce",
        content: `<p>Enlarge or Reduce target(s)?</p>`,
        buttons: {
            confirm: {
                label: "Enlarge",
                callback: () => resolve("enlarge")
            },
            cancel: {
                label: "Reduce",
                callback: () => {resolve("reduce")}
            }
        },
        default: "cancel",
        close: () => {resolve(false)}
        }).render(true);
    });
    let condition = await dialog;
    if (!condition) return;
    const sizeTypes = {
        grg: { enlarge: "grg", reduce: "huge" },
        huge: { enlarge: "grg", reduce: "lg" },
        lg: { enlarge: "huge", reduce: "med" },
        med: { enlarge: "lg", reduce: "sm" },
        sm: { enlarge: "med", reduce: "tiny" },
        tiny: { enlarge: "sm", reduce: "tiny" }
    }
    const sizeMults = {
        grg: { enlarge: 1, reduce: 0.75 },
        huge: { enlarge: 1.33, reduce: 0.66 },
        lg: { enlarge: 1.5, reduce: 0.5 },
        med: { enlarge: 2, reduce: 1 },
        sm: { enlarge: 1, reduce: 0.25 },
        tiny: { enlarge: 4, reduce: 1 }
    }
    let changes = condition == "enlarge" ? [{ key: "system.bonuses.mwak.damage", mode: 2, value: "1d4", priority: 20 }, { key: "system.bonuses.rwak.damage", mode: 2, value: "1d4", priority: 20 }] : [ { key: "system.bonuses.mwak.damage", mode: 2, value: "-1d4", priority: 20 }, { key: "system.bonuses.rwak.damage", mode: 2, value: "-1d4", priority: 20 }];
    args[0].targets.forEach(async t => {
        const effect = t?.actor.effects.find(e => e.origin == args[0].item.uuid);
        if (!effect) return;
        const originalSize = t.actor.system.traits.size;
        changes = changes.concat([{ key: "system.traits.size", mode: 5, value: sizeTypes[originalSize][condition], priority: 20 }, { key: "ATL.height", mode: 5, value: sizeMults[originalSize][condition], priority: 20 }, { key: "ATL.width", mode: 5, value: sizeMults[originalSize][condition], priority: 20 }]);
        await MidiQOL.socket().executeAsGM("updateEffects", { actorUuid: t.actor.uuid, updates: [{ _id: effect.id, changes: effect.changes.concat(changes) }] });
    });
} catch (err) {console.error("Enlarge/Reduce Macro - ", err)}
*/