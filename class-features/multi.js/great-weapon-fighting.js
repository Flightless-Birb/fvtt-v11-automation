try {
	if (args[0].macroPass != "postDamageRollStarted" || args[0].item.system.actionType != "mwak" || !args[0].item.system.properties?.hvy) return;
	let newDamageRolls = args[0].workflow.damageRoll;
	let newBonusDamageRolls = args[0].workflow.bonusDamageRoll;
	newDamageRolls.terms.forEach(t => { 
		if (!t.faces) return;
		t.results.forEach(d => {
			if (d.result >= 3) return;
			let newRoll = new Roll(`1d${t.faces}`).evaluate({ async: false });
			Object.assign(d, { rerolled: true, active: false });
			t.results.push({ result: parseInt(newRoll.result), active: true, hidden: true });
			newDamageRolls._total = newDamageRolls._evaluateTotal();
		});
	});
	newBonusDamageRolls.terms.forEach(t => { 
		if (!t.faces) return;
		t.results.forEach(d => {
			if (d.result >= 3) return;
			let newRoll = new Roll(`1d${t.faces}`).evaluate({ async: false });
			Object.assign(d, { rerolled: true, active: false });
			t.results.push({ result: parseInt(newRoll.result), active: true, hidden: true });
			newBonusDamageRolls._total = newBonusDamageRolls._evaluateTotal();
		});
	});
	if (newDamageRolls) await args[0].workflow.setDamageRoll(newDamageRolls);
	if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRoll(newBonusDamageRolls);
} catch (err)  {console.error("Fighting Style: Great Weapon Fighting Macro - ", err)}