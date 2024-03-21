// Target Ignore Construct/Undead
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => !["undead", "construct"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => !["undead", "construct"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Demon
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => !["demon"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => !["demon"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Non Extraplanar
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => ["aberration", "celestial", "elemental", "fey", "fiend"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => ["aberration", "celestial", "elemental", "fey", "fiend"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Non Fey/Fiend
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => ["fey", "fiend"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => ["fey", "fiend"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Non Fiend/Undead
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => ["fiend", "undead"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => ["fiend", "undead"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Non Humanoid
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => ["humanoid"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => ["humanoid"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Non Undead
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => ["undead"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => ["undead"].find(c => MidiQOL.typeOrRace(t.actor)?.toLowerCase()?.includes(c))));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Taregt Ignore Int <= 2
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => t.actor.system.abilities.int.value > 2).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => t.actor.system.abilities.int.value > 2));
} catch (err) {console.error("Target Ignore Macro - ", err)}

//---------------------------------------------------------------------------------------------------------------------------------------------------------------

// Target Ignore Ally
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => t.document.disposition != args[0].workflow.token.document.disposition).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => t.document.disposition != args[0].workflow.token.document.disposition));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Enemy
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => t.document.disposition == args[0].workflow.token.document.disposition).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => t.document.disposition == args[0].workflow.token.document.disposition));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Pre Targeted
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => ![...args[0].workflow.preSelectedTargets].map(p => p.id).includes(t.id)).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => ![...args[0].workflow.preSelectedTargets].map(p => p.id).includes(t.id)));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Self
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => t.id != args[0].tokenId).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => t.id != args[0].tokenId));
} catch (err) {console.error("Target Ignore Macro - ", err)}

// Target Ignore Unseen
try {
    await game.user.updateTokenTargets([...workflow.targets].filter(t => MidiQOL.canSee(workflow.token, t)).map(t => t.id));
    workflow.targets = new Set([...workflow.targets].filter(t => MidiQOL.canSee(workflow.token, t)));
} catch (err) {console.error("Target Ignore Macro - ", err)}