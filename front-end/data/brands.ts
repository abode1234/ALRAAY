export interface Brand {
  id: string
  name: string
  logo: string
  slug: string
}

export const brands: Brand[] = [
  { id: '1', name: 'MSI', logo: '/msi-logo.jpg', slug: 'msi' },
  { id: '2', name: 'ASUS', logo: '/asus-logo.jpg', slug: 'asus' },
  { id: '3', name: 'Gigabyte', logo: '/gigabyte-logo.jpg', slug: 'gigabyte' },
  { id: '4', name: 'AMD', logo: '/amd-logo.png', slug: 'amd' },
  { id: '5', name: 'Intel', logo: '/intel-logo.png', slug: 'intel' },
  { id: '6', name: 'NZXT', logo: '/nzxt-logo.jpg', slug: 'nzxt' },
  { id: '7', name: 'Corsair', logo: '/corsair-logo.jpg', slug: 'corsair' },
  { id: '8', name: 'Samsung', logo: '/samsung-logo.png', slug: 'samsung' },
  { id: '9', name: 'Kingston', logo: '/kingston-logo.jpg', slug: 'kingston' },
  { id: '10', name: 'Logitech', logo: '/logitech-logo.jpg', slug: 'logitech' },
]
