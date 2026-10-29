// The sales pages show the pictures of MinIO through the image proxy: image_link is a filename, never used as the src alone.
const fs = require('fs')
const path = require('path')

const frontend = path.join(__dirname, '../../../frontend')
const read = (file) => fs.readFileSync(path.join(frontend, file), 'utf8')

const loadHelper = (imageBaseUrl) => {
    const source = read('utils/imageUrl.js').replace('export const', 'const') + '\nreturn imageUrlOf'
    return new Function('useRuntimeConfig', source)(() => ({ public: { imageBaseUrl } }))
}

describe('imageUrlOf', () => {
    const imageUrlOf = loadHelper('/sbtph_performance_system/api/images/')

    test('a filename gets the image proxy path', () => {
        expect(imageUrlOf('image-1760428946673-658219447.png')).toBe('/sbtph_performance_system/api/images/image-1760428946673-658219447.png')
    })

    test('an older path or a full url of the old storage gives the same picture', () => {
        expect(imageUrlOf('/images/a.png')).toBe('/sbtph_performance_system/api/images/a.png')
        expect(imageUrlOf('http://192.168.1.5:9000/bucket/a.png')).toBe('/sbtph_performance_system/api/images/a.png')
    })

    test('no image: no url; a data image stays as it is', () => {
        expect(imageUrlOf('')).toBe('')
        expect(imageUrlOf(null)).toBe('')
        expect(imageUrlOf('data:image/png;base64,AAA')).toBe('data:image/png;base64,AAA')
    })
})

describe('the sales pages', () => {
    const pages = [
        'pages/index.vue', 'pages/dashboard.vue', 'pages/admin/sales_evaluation.vue',
        'pages/agent_performance/month.vue', 'pages/agent_performance/year.vue',
        'pages/team_performance/month.vue', 'pages/team_performance/year.vue', 'pages/overall_performance/month.vue',
    ]

    test.each(pages)('%s: no picture is used as the src without the image path', (page) => {
        const raw = read(page).match(/:src="[^"]*(image_link|team_image)[^"]*"/g) || []
        expect(raw.filter(binding => !binding.includes('imageUrlOf('))).toEqual([])
    })
})
