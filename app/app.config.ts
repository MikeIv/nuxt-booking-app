export default defineAppConfig({
  theme: {
    primaryColor: "#bf9d7c",
  },
  icon: {
    size: "24px", // default <Icon> size applied
    class: "icon", // default <Icon> class applied
    mode: "css", // default <Icon> mode applied
    aliases: {
      nuxt: "logos:nuxt-icon",
    },
    cssLayer: "base", // set the css layer to inject to
  },
});
