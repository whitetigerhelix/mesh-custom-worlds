//
// Copyright (C) Microsoft. All rights reserved.
//
using System.Reflection;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

/// <summary>
/// 
/// </summary>
[RequireComponent(typeof(UniversalAdditionalCameraData))]
public class PreferUIRenderForCamera : MonoBehaviour
{
	[SerializeField]
	string rendererSuffix = "_UI";

    private void Awake()
    {
		var camData = GetComponent<UniversalAdditionalCameraData>();

		// Ugh, so we have no direct access to the m_RendererDataList nicely, and the Set call doesn't let us know if it fails.
		var pipeline = (UniversalRenderPipelineAsset)GraphicsSettings.currentRenderPipeline;
		if (pipeline != null)
		{
			FieldInfo propertyInfo = pipeline.GetType().GetField("m_RendererDataList", BindingFlags.Instance | BindingFlags.NonPublic);

			var renderList = (ScriptableRendererData[])propertyInfo?.GetValue(pipeline);
			if (renderList != null)
			{
				for (int i = renderList.Length - 1; i >= 0; i--)
				{
					if (renderList[i].name.EndsWith(rendererSuffix))
					{
						camData.SetRenderer(i);
						return;
					}
				}
			}
		}
    }
}
