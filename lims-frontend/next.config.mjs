/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "minio.ic.sch.id",
        port: "",
        pathname: "/insancendikia/**/**",
      },
      {
        protocol: "https",
        hostname: "nos.wjv-1.neo.id",
        port: "",
        pathname: "/lims/**/**",
      },
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/",
        destination: "/en/dashboard",
        permanent: true,
        locale: false,
      },
      {
        source: "/:lang(en)",
        destination: "/:lang/dashboard",
        permanent: true,
        locale: false,
      },
      {
        source: "/((?!(?:en|front-pages|favicon.ico)\\b)):path",
        destination: "/en/:path",
        permanent: true,
        locale: false,
      },
    ];
  },
};

export default nextConfig;
