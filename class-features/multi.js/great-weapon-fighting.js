try {
    if (args[0].macroPass != "preDamageRollComplete" || !args[0].damageRoll || args[0].item.system.actionType != "mwak" || !args[0].item.system.properties?.hvy) return;
	let newDamageRoll = args[0].workflow.damageRoll;
	newDamageRoll.terms.forEach(async t => {
		if (!t.faces) return;
		t.results.forEach(async r => {
			if (r.result > 2) return;
			let newRoll = new Roll(`1d${t.faces}`).evaluate({ async: false });
            if (game.dice3d) game.dice3d.showForRoll(newRoll);
			Object.assign(r, { rerolled: true, active: false });
            t.results.push({ result: parseInt(newRoll.result), active: true, hidden: true });
            newDamageRoll._total = newDamageRoll._evaluateTotal();
		});
		await args[0].workflow.setDamageRoll(newDamageRoll);
	});
} catch (err)  {console.error("Fighting Style: Great Weapon Fighting Macro - ", err)}