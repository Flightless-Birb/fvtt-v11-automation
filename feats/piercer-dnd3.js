try {
    if (args[0].tag == "DamageBonus" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && args[0].isCritical && ["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && (args[0].damageRolls.find(r => r.terms.find(t => t.flavor.toLowerCase() == "piercing")) || args[0].bonusDamageRolls.find(r => r.terms.find(t => t.flavor.toLowerCase() == "piercing")))) {
        let faces = args[0].damageRolls.find(r => r.terms.find(t => t.flavor.toLowerCase() == "piercing"))?.faces;
        if (!faces) return;
        return { damageRoll: `1d${faces}[piercing]`, type: "piercing", flavor: "Piercer" }
    } else if (args[0].macroPass == "DamageRollComplete" && (args[0].hitTargets.length || MidiQOL.configSettings().autoRollDamage != "always") && ["mwak", "rwak", "msak", "rsak"].includes(args[0].item.system.actionType) && (args[0].damageRolls.find(r => r.terms.find(t => t.flavor.toLowerCase() == "piercing")) || args[0].bonusDamageRolls.find(r => r.terms.find(t => t.flavor.toLowerCase() == "piercing"))) && !(game.combat && args[0].actor.effects.find(e => e.name == "Used Piercer" && !e.disabled))) {
        let termsContent = "";
        for (let d = 0; d < args[0].workflow.damageRolls?.length; d++) {
            let terms = args[0].damageRolls[d].terms;
            for (let t = 0; t < terms?.length; t++) {
                if (!terms[t].faces) continue;
                let results = terms[t].results;
                for (let r = 0; r < results.length; r++) {
                    if (results[r].rerolled || !results[r].active) continue;
                    termsContent += `<label class='checkbox-label' for='die${t}${r}'>
                        <input type='checkbox' id='die${t}${r}' name='die' value='${results[r].result},${terms[t].faces},${t},${d},damageRolls'/>
                        <tiv style="border:0px; witth: 50px; height:50px;">
                            <img src="icons/svg/d${terms[t].faces}-grey.svg" style="position: relative;">
                            <p style="position: relative; bottom: 55px; font-weight: bolder; font-size: 25px">${results[r].result}</p>
                        </tiv>
                        <p>(${terms[t].flavor ? terms[t].flavor.charAt(0).toUpperCase() + terms[t].flavor.toLowerCase().slice(1) : args[0].workflow.newDefaultDamageType.charAt(0).toUpperCase() ?? args[0].workflow.defaultDamageType.charAt(0).toUpperCase() + args[0].workflow.newDefaultDamageType.toLowerCase().slice(1) ?? args[0].workflow.defaultDamageType.toLowerCase().slice(1)})</p>
                    </label>
                    `;
                }
            }
        }
        for (let d = 0; d < args[0].workflow.bonusDamageRolls?.length; d++) {
            let terms = args[0].bonusDamageRolls[d].terms;
            for (let t = 0; t < terms?.length; t++) {
                if (!terms[t].faces) continue;
                let results = terms[t].results;
                for (let r = 0; r < results.length; r++) {
                    if (results[r].rerolled || !results[r].active) continue;
                    termsContent += `<label class='checkbox-label' for='die${t}${r}'>
                        <input type='checkbox' id='die${t}${r}' name='die' value='${results[r].result},${terms[t].faces},${t},${d},bonusDamageRolls'/>
                        <tiv style="border:0px; witth: 50px; height:50px;">
                            <img src="icons/svg/d${terms[t].faces}-grey.svg" style="position: relative;">
                            <p style="position: relative; bottom: 55px; font-weight: bolder; font-size: 25px">${results[r].result}</p>
                        </tiv>
                        <p>(${terms[t].flavor ? terms[t].flavor.charAt(0).toUpperCase() + terms[t].flavor.toLowerCase().slice(1) : args[0].workflow.newDefaultDamageType.charAt(0).toUpperCase() ?? args[0].workflow.defaultDamageType.charAt(0).toUpperCase() + args[0].workflow.newDefaultDamageType.toLowerCase().slice(1) ?? args[0].workflow.defaultDamageType.toLowerCase().slice(1)})</p>
                    </label>
                    `;
                }
            }
        }
        let content = `
        <style>
        .dice .form-group { display: flex; flex-wrap: wrap; width: 100%; align-items: flex-start; }
        .dice .checkbox-label { display: flex; flex-direction: column; align-items: center; text-align: center; justify-items: center; flex: 1 0 25%; line-height: normal; }
        .dice .check-label input { display: none; }
        .dice img { border: 0px; width: 50px; height: 50px; flex: 0 0 50px; cursor: pointer; }
        </style>
        <form class="dice">
            <div><p>Choose one damage die to reroll:</p></div>
            <div class="form-group" id="dice-group">${termsContent}</div>
        </form>
        <script>
            var limit = 1;
            $("input[type='checkbox'][name='die']").change(function() {
                var bol = $("input[type='checkbox'][name='die']:checked").length >= limit;
                $("input[type='checkbox'][name='die']").not(":checked").attr("disabled", bol);
            });
        </script>
        `;
        let rerollDialog = await new Promise((resolve) => {
            new Dialog({
                title: "Piercer",
                content,
                buttons: {
                    Confirm: {
                        label: "Confirm",
                        icon: '<i class="fas fa-check"></i>',
                        callback: async () => {
                            let rerolls = [];
                            let checked = $("input[type='checkbox'][name='die']:checked"); 
                            for (let c = 0; c < checked.length; c++) {
                                let rollData = checked[c].value.split(",");
                                rerolls.push({ result: rollData[0], faces: rollData[1], dieIndex: rollData[2], rollIndex: rollData[3], rollType: rollData[4] }); 
                            } 
                            resolve(rerolls);
                        },
                    },
                    Cancel: {
                        label: "Cancel",
                        icon: '<i class="fas fa-times"></i>',
                        callback: async () => {resolve(false)},
                    },
                },
                default: "Cancel",
                close: () => {resolve(false)}
            }).render(true);
        });
        let rerolls = await rerollDialog;
        if (!rerolls.length) return;
        let newDamageRolls = args[0].damageRolls;
        let newBonusDamageRolls = args[0].bonusDamageRolls;
        rerolls.forEach(async r => {
            let newRoll = new Roll(`1d${r.faces}`).evaluate({ async: false });
            if (game.dice3d) game.dice3d.showForRoll(newRoll);
            let damageRoll = args[0].workflow[r.rollType][r.rollIndex];
            let replaceRoll = damageRoll.terms[r.dieIndex].results.find(d => d.result == parseInt(r.result) && d.active);
            if (replaceRoll) {
                Object.assign(replaceRoll, { rerolled: true, active: false });
                damageRoll.terms[r.index].results.push({ result: parseInt(newRoll.result), active: true, hidden: true });
                damageRoll._total = damageRoll._evaluateTotal();
            }
        });
        if (newDamageRolls) await args[0].workflow.setDamageRolls(newDamageRolls);
        if (newBonusDamageRolls) await args[0].workflow.setBonusDamageRolls(newBonusDamageRolls);
        if (game.combat) {
            const effectData = {
                disabled: false,
                duration: { turns: 1, seconds: 1 }, 
                flags: { dae: { specialDuration: ["combatEnd"] } },
                icon: "icons/weapons/daggers/dagger-straight-blue.webp",
                name: "Used Piercer",
            }
            await MidiQOL.socket().executeAsGM("createEffects", { actorUuid: args[0].actor.uuid, effects: [effectData] });
        }
	}
} catch (err) {console.error("Piercer Macro - ", err)}