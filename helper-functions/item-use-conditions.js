// must see all targets
!([...workflow.targets].find(t=>!MidiQOL.canSee(workflow.token,t))?ui.notifications.warn("Must be able to see target(s)"):false)

// bastion of law - must see all targets except self
!([...workflow.targets].find(t=>t.id!=workflow.token.id&&!MidiQOL.canSee(workflow.token,t))?ui.notifications.warn("Must be able to see target(s)"):false)

// chain lightning - itemLevel - 2 targets, 1 target must be within 30 ft of all targets, must see 1 target within 30 ft of all targets
!(workflow.targets.size>workflow.itemLevel-2?ui.notifications.warn(`Must have ${workflow.itemLevel-2} or fewer targets`):![...workflow.targets].find(firstTarget=>![...workflow.targets].find(otherTarget=>MidiQOL.computeDistance(firstTarget,otherTarget,false)>30))?ui.notifications.warn(`Secondary targets must be within 30 feet of the original target`):![...workflow.targets].find(firstTarget=>MidiQOL.canSee(workflow.token,firstTarget)&&![...workflow.targets].find(otherTarget=>MidiQOL.computeDistance(firstTarget,otherTarget,false)>30))?ui.notifications.warn("Must be able to see the original target"):false)

// bless - itemLevel + 2 targets
!(workflow.targets.size>workflow.itemLevel+2?ui.notifications.warn(`Must have ${workflow.itemLevel+2} or fewer targets`):false)

// bane - must see all targets, itemLevel + 2 targets
!([...workflow.targets].find(t=>!MidiQOL.canSee(workflow.token,t))?ui.notifications.warn("Must be able to see target(s)"):workflow.targets.size>workflow.itemLevel+2?ui.notifications.warn(`Must have ${workflow.itemLevel+2} or fewer targets`):false)

// must see all targets, item targets
!([...workflow.targets].find(t=>!MidiQOL.canSee(workflow.token,t))?ui.notifications.warn("Must be able to see target(s)"):workflow.targets.size>workflow.item.system.target.value?ui.notifications.warn(`Must have ${workflow.item.system.target.value} or fewer targets`):false)

// item targets
!(workflow.targets.size>workflow.item.system.target.value?ui.notifications.warn(`Must have ${workflow.item.system.target.value} or fewer targets`):false)

