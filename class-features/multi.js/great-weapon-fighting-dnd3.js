try {
    if (args[0].macroPass != "postDamageRollStarted" || args[0].item.system.actionType != "mwak" || !args[0].item.system.properties.includes("hvy") || (5 * Math.floor(MidiQOL.computeDistance(args[0].workflow.token, args[0].targets[0], false) / 5) > (args[0].item.system.properties.includes("rch") ? 10 : 5) + (args[0].actor.flags?.["midi-qol"]?.range?.mwak ?? 0))) return;
	let newDamageRolls = args[0].workflow.damageRolls;
	let newBonusDamageRolls = args[0].workflow.bonusDamageRolls;
	newDamageRolls.forEach(async r => {
		r.terms.forEach(t => { 
			if (!t.faces) return;
			t.results.forEach(d => {
				if (d.result >= 3) return;
				let newRoll = new Roll(`1d${t.faces}`).evaluate({ async: false });
				Object.assign(d, { rerolled: true, active: false });
            	t.results.push({ result: parseInt(newRoll.result), active: true, hidden: true });
				r._total = r._evaluateTotal();
			});
		});
	});
	newBonusDamageRolls.forEach(async r => {
		r.terms.forEach(t => { 
			if (!t.faces) return;
			t.results.forEach(d => {
				if (d.result >= 3) return;
				let newRoll = new Roll(`1d${t.faces}`).evaluate({ async: false });
				Object.assign(d, { rerolled: true, active: false });
            	t.results.push({ result: parseInt(newRoll.result), active: true, hidden: true });
				r._total = r._evaluateTotal();
			});
		});
	});
	if (newDamageRolls) await args[0].workflow.setDamageRolls(newDamageRolls);
	if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRolls(newBonusDamageRolls);
} catch (err)  {console.error("Fighting Style: Great Weapon Fighting Macro - ", err)}