// WIP

try {
    if (args[0] != "on") return;
    const lastArg = args[args.length - 1];
    const tokenOrActor = await fromUuid(lastArg.actorUuid);
	const actor = tokenOrActor.actor ? tokenOrActor.actor : tokenOrActor;
    const items = actor.items.filter(i => i.name.includes(lastArg.efData.name) && i.uuid != lastArg.efData.origin && !i.system.consume.target);
    const parentId = lastArg.efData.origin.match(/(?<=\.Item\.)(.*?)(?=$)/)[0];
    items.forEach(async i => { await i.update({ name: i.name + ` (${lastArg.efData.name})`, system: { component: {  }, consume: { target: parentId } } }); });
} catch (err) {console.error("Create Item Uses Consumption Macro - ", err)}