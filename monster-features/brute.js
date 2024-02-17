try {
    if (args[0].tag != "DamageBonus" || !args[0].damageRoll || args[0].item.system.actionType != "mwak" || 5 * Math.floor(MidiQOL.computeDistance(args[0].workflow.token, args[0].targets[0], false) / 5) > (args[0].item.system.properties.rch ? 10 : 5) + (args[0].actor.flags?.["midi-qol"]?.range?.mwak ?? 0)) return;
    const faces = args[0].damageRoll.terms[0].faces;
    const diceMult = args[0].isCritical ? 2 : 1;
    let bonusRoll = await new Roll('0 + ' + `${diceMult}d${faces}`).evaluate({async: true});
    if (game.dice3d) game.dice3d.showForRoll(bonusRoll);
    for (let i = 1; i < bonusRoll.terms.length; i++) {
        args[0].damageRoll.terms.push(bonusRoll.terms[i]);
    }
    args[0].damageRoll._formula = args[0].damageRoll._formula + ' + ' + `${diceMult}d${faces}`;
    args[0].damageRoll._total = args[0].damageRoll.total + bonusRoll.total;
    await args[0].workflow.setDamageRoll(args[0].damageRoll);
    args[0].workflow.brute = true;
} catch (err) {console.error("Brute Macro - ", err)}