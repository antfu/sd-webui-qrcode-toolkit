;(() => {
  /** @type {HTMLIFrameElement} */
  let _iframe

  function getIframe() {
    _iframe ||= document.getElementById('qrtoolkit-iframe')
    return _iframe
  }

  function sendMessage(event, data) {
    const iframe = getIframe()
    iframe.contentWindow.postMessage(
      JSON.stringify({
        source: 'qrtoolkit-parent',
        event,
        data,
      }),
      '*'
    )
  }

  function gotoTab(tabname, tabsId = 'tabs') {
    Array.from(gradioApp().querySelectorAll(`#${tabsId} > div:first-child button`)).forEach((button) => {
      if (button.textContent.trim() === tabname) {
        button.click()
      }
    })
  }

  /**
   * Converts a Data URL string to a file object
   *
   * Based on https://stackoverflow.com/questions/28041840/convert-dataurl-to-file-using-javascript
   *
   * @param {string} dataurl Data URL to load into a file
   * @returns
   */
  function dataURLtoFile(dataurl) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], 'file', { type: mime })
  }

  function qrtoolkitInit() {
    sendMessage('init')
  }

  async function getImageFromGallery() {
    var buttons = gradioApp().querySelectorAll('[style="display: block;"].tabitem div[id$=_gallery] .thumbnail-item.thumbnail-small')
    var button = gradioApp().querySelector('[style="display: block;"].tabitem div[id$=_gallery] .thumbnail-item.thumbnail-small.selected')

    if (!button) button = buttons[0]

    if (!button) throw new Error('[openoutpaint] No image available in the gallery')

    const canvas = document.createElement('canvas')
    const image = document.createElement('img')
    image.src = button.querySelector('img').src

    await image.decode()

    canvas.width = image.width
    canvas.height = image.height

    canvas.getContext('2d').drawImage(image, 0, 0)

    return canvas.toDataURL()
  }

  window.addEventListener('message', async (event) => {
    const { data } = event
    if (typeof data !== 'string') return

    try {
      const json = JSON.parse(data)
      if (json.source !== 'qrtoolkit') return
      console.log('Message from QR Toolkit', json)

      const setImageInput = (...selectors) => {
        for (const selector of selectors) {
          const input = gradioApp().querySelector(selector)
          if (!input) {
            console.error('QR Toolkit SD: Could not find input', selector)
            continue
          }
          const container = new DataTransfer()
          container.items.add(dataURLtoFile(json.data))
          input.files = container.files
          input.dispatchEvent(new Event('change'))
        }
      }

      switch (json.event) {
        case 'init':
          qrtoolkitInit()
          break
        case 'setControlNet':
          gotoTab('img2img')
          gotoTab('Inpaint', 'mode_img2img')
          let label = document.querySelector('#img2img_controlnet .label-wrap')
          if (!label.classList.contains('open')) label.click()
          await new Promise((resolve) => setTimeout(resolve, 50))
          setImageInput('#img2img_controlnet_ControlNet_input_image input[type=file]')
          gotoTab('txt2img')
          label = document.querySelector('#txt2img_controlnet .label-wrap')
          if (!label.classList.contains('open')) label.click()
          await new Promise((resolve) => setTimeout(resolve, 50))
          setImageInput('#txt2img_controlnet_ControlNet_input_image input[type=file]')
          break
        case 'setInpaint':
          gotoTab('img2img')
          gotoTab('Inpaint', 'mode_img2img')
          setImageInput('#img2img_inpaint_tab input[type=file]')
          break
        case 'setImg2img':
          gotoTab('img2img')
          gotoTab('img2img', 'mode_img2img')
          setImageInput('#img2img_img2img_tab input[type=file]')
          break
      }
    } catch (error) {
      console.error('QR Toolkit SD', error)
    }
  })

  setTimeout(qrtoolkitInit, 1_000)
  setTimeout(qrtoolkitInit, 10_000)

  async function qrtoolkitSendImage() {
    let image
    try {
      image = await getImageFromGallery()
    } catch (error) {
      console.log(error)
    }
    if (image) {
      gotoTab('QR Toolkit')
      sendMessage('setImage', image)
    }
  }

  async function qrtoolkitSendScanner() {
    let image
    try {
      image = await getImageFromGallery()
    } catch (error) {
      console.log(error)
    }
    if (image) {
      gotoTab('QR Toolkit')
      sendMessage('setScannerImage', image)
    }
  }

  window.qrtoolkitInit = qrtoolkitInit
  window.qrtoolkitSendImage = qrtoolkitSendImage
  window.qrtoolkitSendScanner = qrtoolkitSendScanner
})()
