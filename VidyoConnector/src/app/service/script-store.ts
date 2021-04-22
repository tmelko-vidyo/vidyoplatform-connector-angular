interface Scripts {
  name: string;
  src: string;
  css: string;
}

export const ScriptStore: Scripts[] = [
  {
    name: 'VidyoClient',

    /* Load locally 21.x */
    src: '/assets/latest_build/VidyoClient.js',
    css: '/assets/latest_build/VidyoClient.css',
  },
];
