// ************************** Styles ******************************

(function (c, structures, m, JSON, Object, undefined) {
    'use strict';

    c.DEFAULT_STYLES = {
        // default canvas properties

        //backgroundColor:'#FFFFFF',
        scale:1.5,
        rotateAngle:0,
        lightDirection_3D:[-.1, -.1, -1],
        lightDiffuseColor_3D:'#FFFFFF',
        lightSpecularColor_3D:'#FFFFFF',
        projectionPerspective_3D:true,
        projectionPerspectiveVerticalFieldOfView_3D:45,
        projectionOrthoWidth_3D:40,
        projectionWidthHeightRatio_3D:undefined,
        projectionFrontCulling_3D:.1,
        projectionBackCulling_3D:10000,
        cullBackFace_3D:true,
        fog_mode_3D:0,
        fog_color_3D:'#000000',
        fog_start_3D:0,
        fog_end_3D:1,
        fog_density_3D:1,
        shadow_3D:false,
        shadow_intensity_3D:.85,
        flat_color_3D:false,
        antialias_3D:true,
        gammaCorrection_3D:2.2,
        colorError:'#c10000',
        colorPreview:'#cbcbcb',

        // hover, selection
        colorHover:'#0060B2',
        colorSelect:'rgba(0,96,178,0.3)',
        hover_lineWidth: 0.7,
        lasso_lineWidth: 1,
        atoms_selectRadius:8,

        // 3D shaders
        // default ssao
        ssao_3D:false,
        ssao_kernel_radius:17,
        ssao_kernel_samples:32,
        ssao_power:1.0,
        // default outline 3D
        outline_3D:false,
        outline_thickness:1.0,
        outline_normal_threshold:0.85,
        outline_depth_threshold:0.1,
        // defult fxaa antialiasing
        fxaa_edgeThreshold:1.0 / 16.0,
        fxaa_edgeThresholdMin:1.0 / 12.0,
        fxaa_searchSteps:64,
        fxaa_searchThreshold:1.0 / 4.0,
        fxaa_subpixCap:1.0,
        fxaa_subpixTrim:0.0,



        // default atom properties
        atoms_display:true,
        atoms_color:'#000000',
        atoms_font_size_2D:11,
        atoms_font_families_2D:['Helvetica', 'Arial', 'Dialog'],
        atoms_font_bold_2D:true,
        atoms_font_italic_2D:false,
        atoms_circles_2D:false,
        atoms_circleDiameter_2D:10,
        atoms_circleBorderWidth_2D:1,
        atoms_lonePairDistance_2D:8,
        atoms_lonePairSpread_2D:4,
        atoms_lonePairDiameter_2D:1,
        atoms_useJMOLColors:true,
        atoms_usePYMOLColors:false,
        atoms_HBlack_2D:true,
        atoms_implicitHydrogens_2D:true,
        atoms_displayTerminalCarbonLabels_2D:false,
        atoms_showHiddenCarbons_2D:true,
        atoms_showAttributedCarbons_2D:true,
        atoms_displayAllCarbonLabels_2D:false,
        atoms_resolution_3D:30,
        atoms_sphereDiameter_3D:.8,
        atoms_useVDWDiameters_3D:false,
        atoms_vdwMultiplier_3D:1,
        atoms_materialAmbientColor_3D:'#000000',
        atoms_materialSpecularColor_3D:'#555555',
        atoms_materialShininess_3D:32,
        atoms_nonBondedAsStars_3D:false,
        atoms_displayLabels_3D:false,

        // default bond properties
        bondLength_2D:20,
        angstromsPerBondLength:1.25,
        bonds_display:true,
        bonds_color:'#000000',
        bonds_width_2D:1.5,
        bonds_useAbsoluteSaturationWidths_2D:true,
        bonds_saturationWidth_2D:.2,
        bonds_saturationWidthAbs_2D:3.5,
        bonds_ends_2D:'round',
        bonds_splitColor:false,
        bonds_colorGradient:false,
        bonds_saturationAngle_2D:m.PI / 3,
        bonds_symmetrical_2D:false,
        bonds_clearOverlaps_2D:false,
        bonds_overlapClearWidth_2D:.5,
        bonds_atomLabelBuffer_2D:1,
        bonds_wedgeThickness_2D:6,
        bonds_wavyLength_2D:4,
        bonds_hashWidth_2D:1,
        bonds_hashSpacing_2D:2.5,
        bonds_dotSize_2D:2,
        bonds_lewisStyle_2D:false,
        bonds_showBondOrders_3D:false,
        bonds_resolution_3D:30,
        bonds_renderAsLines_3D:false,
        bonds_cylinderDiameter_3D:.3,
        bonds_pillLatitudeResolution_3D:10,
        bonds_pillLongitudeResolution_3D:20,
        bonds_pillHeight_3D:.3,
        bonds_pillSpacing_3D:.1,
        bonds_pillDiameter_3D:.3,
        bonds_materialAmbientColor_3D:'#000000',
        bonds_materialSpecularColor_3D:'#555555',
        bonds_materialShininess_3D:32,

        // default macromolecular properties
        proteins_displayRibbon:true,
        proteins_displayBackbone:false,
        proteins_backboneThickness:1.5,
        proteins_backboneColor:'#CCCCCC',
        proteins_ribbonCartoonize:false,
        proteins_displayPipePlank:false,
        // shapely, amino, polarity, rainbow, acidity
        proteins_residueColor:'none',
        proteins_primaryColor:'#FF0D0D',
        proteins_secondaryColor:'#FFFF30',
        proteins_ribbonCartoonHelixPrimaryColor:'#00E740',
        proteins_ribbonCartoonHelixSecondaryColor:'#9905FF',
        proteins_ribbonCartoonSheetColor:'#E8BB99',
        proteins_tubeColor:'#FF0D0D',
        proteins_tubeResolution_3D:15,
        proteins_ribbonThickness:.2,
        proteins_tubeThickness:0.5,
        proteins_plankSheetWidth:3.5,
        proteins_cylinderHelixDiameter:4,
        proteins_verticalResolution:8,
        proteins_horizontalResolution:8,
        proteins_materialAmbientColor_3D:'#000000',
        proteins_materialSpecularColor_3D:'#555555',
        proteins_materialShininess_3D:32,
        nucleics_display:true,
        nucleics_tubeColor:'#CCCCCC',
        nucleics_baseColor:'#C10000',
        // shapely, rainbow
        nucleics_residueColor:'none',
        nucleics_tubeThickness:1.5,
        nucleics_tubeResolution_3D:15,
        nucleics_verticalResolution:8,
        nucleics_materialAmbientColor_3D:'#000000',
        nucleics_materialSpecularColor_3D:'#555555',
        nucleics_materialShininess_3D:32,
        macro_displayAtoms:false,
        macro_displayBonds:false,
        macro_atomToLigandDistance:-1,
        macro_showWater:false,
        macro_colorByChain:false,
        macro_rainbowColors:['#0000FF', '#00FFFF', '#00FF00', '#FFFF00', '#FF0000'],

        // default surface properties
        surfaces_display:true,
        surfaces_alpha:.5,
        surfaces_style:'Solid',
        surfaces_color:'white',
        surfaces_materialAmbientColor_3D:'#000000',
        surfaces_materialSpecularColor_3D:'#000000',
        surfaces_materialShininess_3D:32,

        // default spectrum properties
        plots_color:'#000000',
        plots_width:1,
        plots_showIntegration:false,
        plots_integrationColor:'#c10000',
        plots_integrationLineWidth:1,
        plots_showGrid:false,
        plots_gridColor:'gray',
        plots_gridLineWidth:.5,
        plots_showYAxis:true,
        plots_flipXAxis:false,

        // default shape properties
        text_font_size:12,
        text_font_families:['Helvetica', 'Arial', 'Dialog'],
        text_font_bold:true,
        text_font_italic:false,
        text_font_stroke_3D:true,
        text_color:'#000000',
        shapes_color:'#000000',
        shapes_lineWidth:1,
        shapes_pointSize:2,
        shapes_arrowLength_2D:4,
        compass_display:false,
        compass_axisXColor_3D:'#FF0000',
        compass_axisYColor_3D:'#00FF00',
        compass_axisZColor_3D:'#0000FF',
        compass_size_3D:50,
        compass_resolution_3D:10,
        compass_displayText_3D:true,
        compass_type_3D:0,
        measurement_update_3D:false,
        measurement_angleBands_3D:10,
        measurement_displayText_3D:true
    }

    structures.Styles = function (copy) {
        // use json for a copy of arrays without assigning the same pointers from DEFAULT_STYLES
        Object.assign(this, JSON.parse(JSON.stringify(copy===undefined?c.DEFAULT_STYLES:copy)));
    };
    let _ = structures.Styles.prototype;
    _.set3DRepresentation = function (representation) {
        this.atoms_display = true;
        this.bonds_display = true;
        this.bonds_color = '#777777';
        this.atoms_useVDWDiameters_3D = true;
        this.atoms_useJMOLColors = true;
        this.bonds_splitColor = true;
        this.bonds_showBondOrders_3D = true;
        this.bonds_renderAsLines_3D = false;
        if (representation === 'Ball and Stick') {
            this.atoms_vdwMultiplier_3D = .3;
            this.bonds_splitColor = false;
            this.bonds_cylinderDiameter_3D = .3;
            this.bonds_materialAmbientColor_3D = Chemio.DEFAULT_STYLES.atoms_materialAmbientColor_3D;
            this.bonds_pillDiameter_3D = .15;
        } else if (representation === 'van der Waals Spheres') {
            this.bonds_display = false;
            this.atoms_vdwMultiplier_3D = 1;
        } else if (representation === 'Stick') {
            this.atoms_useVDWDiameters_3D = false;
            this.bonds_showBondOrders_3D = false;
            this.bonds_cylinderDiameter_3D = this.atoms_sphereDiameter_3D = .8;
            this.bonds_materialAmbientColor_3D = this.atoms_materialAmbientColor_3D;
        } else if (representation === 'Wireframe') {
            this.atoms_useVDWDiameters_3D = false;
            this.bonds_cylinderDiameter_3D = this.bonds_pillDiameter_3D = .05;
            this.atoms_sphereDiameter_3D = .15;
            this.bonds_materialAmbientColor_3D = Chemio.DEFAULT_STYLES.atoms_materialAmbientColor_3D;
        } else if (representation === 'Line') {
            this.atoms_display = false;
            this.bonds_renderAsLines_3D = true;
            this.bonds_width_2D = 1;
            this.bonds_cylinderDiameter_3D = .05;
        } else {
            alert('"' + representation + '" is not recognized. Use one of the following strings:\n\n' + '1. Ball and Stick\n' + '2. van der Waals Spheres\n' + '3. Stick\n' + '4. Wireframe\n' + '5. Line\n');
        }
    };
    _.copy = function () {
        return new structures.Styles(this);
    };

})(Chemio, Chemio.structures, Math, JSON, Object);
