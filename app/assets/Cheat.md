# Cheat


### import resolutions



<span style="color:#f56200">Пример</span>

<div style="font-size: 1.4em;">

```scss
@use "~/assets/styles/variables/resolutions" as size;

@media (min-width: #{size.$tabletMax})
```
</div>


### import z-index

<span style="color:#f56200">Пример</span>
<div style="font-size: 1.4em;">

```scss
@use "~/assets/styles/variables/z-index" as z;

z-index: z.z("intro");
```
</div>

### UIcon

<span style="color:#f56200">Пример</span>
<div style="font-size: 1.4em;">

```vue
<UIcon v-if="hidenIcon" name="i-calendar" class="calendarIcon" />
```
</div>