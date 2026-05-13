const svgViewBox = { width: 1400, height: 320 }
const stageCount = 5
const horizontalPadding = 0
const verticalPadding = 20
const availableWidth = svgViewBox.width - horizontalPadding * 2
const availableHeight = svgViewBox.height - verticalPadding * 2
const centerY = verticalPadding + availableHeight / 2

export function useNscSalesPipeline(pipelineStages, leadSources) {
  const getStagePercentage = (index) => {
    if (index === 0) return 100
    return pipelineStages.value[index]?.percentage || 0
  }

  const getStageCenterX = (index) => (svgViewBox.width / stageCount) * (index + 0.5)

  const getStageWidth = (index) => {
    const percentage = getStagePercentage(index)
    const maxWidth = availableWidth * 0.2
    return (maxWidth * percentage) / 100
  }

  const getSourceStagePercentage = (sourceIndex, stageIndex) => {
    if (stageIndex === 0) return 100
    return leadSources[sourceIndex]?.conversionRates?.[stageIndex] ?? getStagePercentage(stageIndex)
  }

  const getTotalFlowHeight = (stageIndex) => {
    const percentage = getStagePercentage(stageIndex)
    return (availableHeight * percentage) / 100
  }

  const getLayerFlowHeight = (layerIndex, stageIndex) => {
    const source = leadSources[layerIndex]
    if (!source) return 0
    const totalVolume = leadSources.reduce((sum, item) => sum + (item.volume || 0), 0)
    const baseHeight = getTotalFlowHeight(stageIndex) * ((source.volume || 0) / totalVolume)
    return baseHeight * (getSourceStagePercentage(layerIndex, stageIndex) / 100)
  }

  const getStackedFlowHeight = (stageIndex) => {
    return leadSources.reduce((sum, source, layerIndex) => {
      return sum + getLayerFlowHeight(layerIndex, stageIndex)
    }, 0)
  }

  const getLayerTopY = (layerIndex, stageIndex) => {
    const flowTop = centerY - getStackedFlowHeight(stageIndex) / 2
    let cumulativeY = flowTop

    for (let i = 0; i < layerIndex; i++) {
      cumulativeY += getLayerFlowHeight(i, stageIndex)
    }

    return cumulativeY
  }

  const getLayerBottomY = (layerIndex, stageIndex) => {
    return getLayerTopY(layerIndex, stageIndex) + getLayerFlowHeight(layerIndex, stageIndex)
  }

  const createContinuousPath = (layerIndex) => {
    const stages = pipelineStages.value
    const pathParts = []
    const getLeftX = (stageIndex) => {
      if (stageIndex === 0) return 0
      return getStageCenterX(stageIndex) - getStageWidth(stageIndex) / 2
    }
    const getRightX = (stageIndex) => {
      return getStageCenterX(stageIndex) + getStageWidth(stageIndex) / 2
    }

    pathParts.push(`M ${getLeftX(0)} ${getLayerTopY(layerIndex, 0)}`)

    for (let i = 0; i < stages.length; i++) {
      const topY = getLayerTopY(layerIndex, i)
      const leftX = getLeftX(i)
      const rightX = getRightX(i)

      if (i === 0) {
        pathParts.push(`L ${rightX} ${topY}`)
      } else {
        const previousRightX = getRightX(i - 1)
        const previousTopY = getLayerTopY(layerIndex, i - 1)
        const midX = (previousRightX + leftX) / 2
        pathParts.push(`C ${previousRightX} ${previousTopY}, ${midX} ${previousTopY}, ${midX} ${(previousTopY + topY) / 2}`)
        pathParts.push(`C ${midX} ${(previousTopY + topY) / 2}, ${midX} ${topY}, ${leftX} ${topY}`)
        pathParts.push(`L ${rightX} ${topY}`)
      }
    }

    const lastIndex = stages.length - 1
    const lastRightX = getRightX(lastIndex)
    const lastTopY = getLayerTopY(layerIndex, lastIndex)
    const lastBottomY = getLayerBottomY(layerIndex, lastIndex)
    const exitControlX = lastRightX + (svgViewBox.width - lastRightX) * 0.7
    pathParts.push(`C ${lastRightX} ${lastTopY}, ${exitControlX} ${lastTopY}, ${svgViewBox.width} ${centerY}`)
    pathParts.push(`C ${svgViewBox.width} ${centerY}, ${exitControlX} ${lastBottomY}, ${lastRightX} ${lastBottomY}`)

    for (let i = lastIndex; i > 0; i--) {
      const bottomY = getLayerBottomY(layerIndex, i)
      const leftX = getLeftX(i)
      const previousRightX = getRightX(i - 1)
      const previousBottomY = getLayerBottomY(layerIndex, i - 1)
      const midX = (previousRightX + leftX) / 2
      pathParts.push(`C ${leftX} ${bottomY}, ${midX} ${bottomY}, ${midX} ${(previousBottomY + bottomY) / 2}`)
      pathParts.push(`C ${midX} ${(previousBottomY + bottomY) / 2}, ${midX} ${previousBottomY}, ${previousRightX} ${previousBottomY}`)
      pathParts.push(`L ${getLeftX(i - 1)} ${previousBottomY}`)
    }

    pathParts.push(`L ${getLeftX(0)} ${getLayerBottomY(layerIndex, 0)}`)
    pathParts.push('Z')
    return pathParts.join(' ')
  }

  return {
    svgViewBox,
    stageCount,
    createContinuousPath
  }
}
