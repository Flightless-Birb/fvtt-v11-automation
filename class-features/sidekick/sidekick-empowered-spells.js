try {
    if (args[0].tag == "OnUse" && args[0].macroPass == "postDamageRoll" && args[0].damageRoll && args[0].item.type == "spell" && args[0].item.system.level > 0 && ["prepared", "always", "pact"].includes(args[0].item.system.preparation.mode) && args[0].item.system.damage.parts.find(p => !["temphp", "midinone", ""].includes(p[1].toLowerCase() && p[0].toLowerCase().includes("d"))) && args[0].actor.items.find(i => i.name.toLowerCase().includes(`chosen school: ${args[0].item.system.school.slice(0, 2)}`))) {
		let bonusRoll = await new Roll('0 + ' + `${args[0].actor.system.abilities[args[0].actor.system.attributes.spellcasting].mod}`).evaluate({async: true});
		for (let i = 1; i < bonusRoll.terms.length; i++) {
			args[0].damageRoll.terms.push(bonusRoll.terms[i]);
		}
		args[0].damageRoll._formula = args[0].damageRoll._formula + ' + ' + `${args[0].actor.system.abilities[args[0].actor.system.attributes.spellcasting].mod}`;
		args[0].damageRoll._total = args[0].damageRoll.total + bonusRoll.total;
		await args[0].workflow.setDamageRoll(args[0].damageRoll);
	}
} catch (err) {console.error("Empowered Spells Macro - ", err)}