from typing import Dict, List, Set


def is_visual_element(node: Dict):
    """
    To check if all the CHILD FRAMES are just visual elements
    to export the entire PARENT FRAME
    """
    if not isinstance(node, dict):
        return False
    node_type = node.get("type", "")
    if node_type == "TEXT":
        return False
    if node_type in ["VECTOR", "LINE"]:
        return True
    fills = node.get("fills", [])
    if isinstance(fills, list):
        for fill in fills:
            if isinstance(fill, dict):
                fill_type = fill.get("type", "")
                if fill_type in [
                    "GRADIENT_LINEAR",
                    "GRADIENT_RADIAL",
                    "GRADIENT_ANGULAR",
                    "GRADIENT_DIAMOND",
                ]:
                    return True
    effects = node.get("effects", [])
    if isinstance(effects, list) and len(effects) > 0:
        for effect in effects:
            if isinstance(effect, dict) and effect.get("visible", True):
                effect_type = effect.get("type", "")
                if effect_type in [
                    "BACKGROUND_BLUR",
                    "LAYER_BLUR",
                    "DROP_SHADOW",
                    "INNER_SHADOW",
                ]:
                    return True
    strokes = node.get("strokes", [])
    if isinstance(strokes, list) and len(strokes) > 0:
        return True
    return False


def has_only_visual_children(node: Dict):
    """
    To check if a FRAME/GROUP has only visual elements
    """
    children = node.get("children", [])
    if not children:
        return False
    for child in children:
        if not isinstance(child, dict):
            continue
        child_type = child.get("type", "")
        if child_type == "TEXT":
            return False
        if child_type in ["FRAME", "GROUP"]:
            if not has_only_visual_children(child):
                return False
        elif not is_visual_element(child):
            return False
    return True


def has_mixed_children(node: Dict):
    """
    To check if a FRAME/GROUP has both visual elements and text
    """
    children = node.get("children", [])
    if not children:
        return False
    has_visual = False
    has_text = False
    for child in children:
        if not isinstance(child, dict):
            continue
        child_type = child.get("type", "")
        if child_type == "TEXT":
            has_text = True
        elif is_visual_element(child):
            has_visual = True
        if has_visual and has_text:
            return True
    return has_visual and has_text


def detect_export_children(node: Dict, export_map: Dict[str, Dict]):
    if export_map is None:
        export_map = {}
    if not isinstance(node, dict):
        return export_map
    node_id = node.get("id")
    node_type = node.get("type", "")
    if not node_id:
        return export_map
    if node_type in ["FRAME", "GROUP"]:
        if has_only_visual_children(node):
            export_map[node_id] = {
                "strategy": "EXPORT_FRAME",
                "node": node,
                "children_to_export": [],
            }
            return export_map
        elif has_mixed_children(node):
            visual_children_ids = []
            children = node.get("children", [])
            for child in children:
                if not isinstance(child, dict):
                    continue
                child_type = child.get("type", "")
                child_id = child.get("id")
                if not child_id:
                    continue
                if is_visual_element(child):
                    visual_children_ids.append(child_id)
                elif child_type in ["FRAME", "GROUP"]:
                    if has_only_visual_children(child):
                        visual_children_ids.append(child_id)
            if visual_children_ids:
                export_map[node_id] = {
                    "strategy": "EXPORT_CHILDREN",
                    "node": node,
                    "children_to_export": visual_children_ids,
                }
    children = node.get("children", [])
    if children:
        for child in children:
            if isinstance(child, dict):
                detect_export_children(child, export_map)
    return export_map

def should_export_to_image(node: Dict):
    if not isinstance(node, dict):
        return False
    node_type = node.get("type", "")
    if node_type in ["VECTOR", "LINE"]:
        return True

    # For FRAME/GROUP, check if it has visual-only children
    if node_type in ["FRAME", "GROUP"]:
        if has_only_visual_children(node):
            return True
        return False

    fills = node.get("fills", [])
    has_gradient = False
    if isinstance(fills, list):
        for fill in fills:
            if isinstance(fill, dict):
                fill_type = fill.get("type", "")
                if fill_type in ["GRADIENT_LINEAR", "GRADIENT_RADIAL",
  "GRADIENT_ANGULAR", "GRADIENT_DIAMOND"]:
                    has_gradient = True
    effects = node.get("effects", [])
    has_complex_effect = False

    if isinstance(effects, list) and len(effects) > 0:
      for effect in effects:
          if isinstance(effect, dict) and effect.get("visible", True):
              effect_type = effect.get("type", "")
              if effect_type in ["BACKGROUND_BLUR", "LAYER_BLUR",
"DROP_SHADOW", "INNER_SHADOW"]:
                  has_complex_effect = True
                  break

    if has_gradient and has_complex_effect:
      return True

    return False

def count_vectors_recursive(node: Dict, count_visible_only: bool = True):
    if not isinstance(node, dict):
        return 0
    count = 0
    node_type = node.get("type", "")
    if node_type in ["VECTOR", "LINE"]:
        if count_visible_only:
            visible = node.get("visible", True)
            if visible is not False:
                count += 1
        else:
            count += 1
    children = node.get("children", [])
    if children:
        for child in children:
            if isinstance(child, dict):
                count += count_vectors_recursive(child, count_visible_only)
    return count


def get_export_format(node: Dict):
    if not should_export_to_image(node):
        return "CODE_CSS"
    vector_count = count_vectors_recursive(node, count_visible_only=True)
    if vector_count <= 3:
        return "EMBED_SVG"
    else:
        return "EXPORT_PNG"
