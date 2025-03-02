'use client'

const ClientSideCloudinaryUpload = () => {
  async function getSingnature(paramsToSign: any): Promise<string> {
    const response = await fetch('/api/sign', {
      method: 'POST',
      body: JSON.stringify({
        paramsToSign,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()

    if (!data.signature) {
      throw new Error('No signature found')
    }

    return data.signature
  }

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'signed_upload_demo_form')
    formData.append('timestamp', Math.round(new Date().getTime() / 1000).toString())
    formData.append('api_key', process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!)

    // see https://cloudinary.com/documentation/authentication_signatures#manual_signature_generation
    const keysNotToSign = ['file', 'cloud_name', 'resource_type', 'api_key']
    const paramsToSign = Object.fromEntries(
      Array.from(formData.entries()).filter(([key]) => !keysNotToSign.includes(key)),
    )

    const signature = await getSingnature(paramsToSign)
    formData.append('signature', signature)

    const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    })

    const data = await response.text()

    console.log(JSON.parse(data))

    const str = JSON.stringify(JSON.parse(data), null, 4)
    document.getElementById('formdata')!.innerHTML += str
  }

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const fileInput = e.target.querySelector('input[type="file"]')
          if (fileInput.files.length > 0) {
            uploadFile(fileInput.files[0])
          }
        }}
      >
        <input type="file" />
        <button type="submit">Upload File</button>
      </form>
      <pre id="formdata"></pre>
    </div>
  )
}

export default ClientSideCloudinaryUpload
