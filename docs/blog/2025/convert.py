import os
import re
import yaml

def convert_hugo_to_vitepress(file_path):
    """
    纯文本正则解析，安全转换 Hugo TOML 到 VitePress YAML
    """
    try:
        # 1. 读取文件原始内容
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 2. 使用正则表达式精准提取 Front Matter 和 正文
        # 匹配以 +++ 开头和结尾的块
        match = re.match(r'^\+\+\+\s*\n(.*?)\n\+\+\+\s*\n(.*)$', content, re.DOTALL)
        
        if not match:
            print(f"[跳过] {file_path} 未找到 Hugo Front Matter，保持原样。")
            return

        toml_str = match.group(1)
        body_content = match.group(2)

        # 3. 简单解析 TOML 字符串为字典 (仅处理基础键值对)
        metadata = {}
        for line in toml_str.split('\n'):
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            
            # 处理 key = "value" 或 key = 'value'
            str_match = re.match(r'^(\w+)\s*=\s*["\'](.+?)["\']$', line)
            # 处理 key = true/false
            bool_match = re.match(r'^(\w+)\s*=\s*(true|false)$', line, re.IGNORECASE)
            # 处理 key = ["a", "b"]
            list_match = re.match(r'^(\w+)\s*=\s*\[(.+)\]$', line)

            if str_match:
                metadata[str_match.group(1)] = str_match.group(2)
            elif bool_match:
                metadata[bool_match.group(1)] = bool_match.group(2).lower() == 'true'
            elif list_match:
                # 提取列表内容并清理引号
                items = re.findall(r'["\'](.+?)["\']', list_match.group(2))
                metadata[list_match.group(1)] = items

        # 4. 字段映射到 VitePress 格式
        vitepress_metadata = {}
        if 'title' in metadata:
            vitepress_metadata['title'] = metadata['title']
        if 'date' in metadata:
            vitepress_metadata['date'] = metadata['date']
        if 'description' in metadata and metadata['description']:
            vitepress_metadata['summary'] = metadata['description']
        if 'categories' in metadata:
            vitepress_metadata['tags'] = metadata['categories']

        # 5. 转换为 YAML 字符串
        yaml_str = yaml.safe_dump(
            vitepress_metadata, 
            allow_unicode=True, 
            sort_keys=False, 
            default_flow_style=False
        )

        # 6. 重新组装并写回文件
        final_content = f"---\n{yaml_str}---\n{body_content}"
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(final_content)
            
        print(f"[成功] 已转换: {file_path}")

    except Exception as e:
        print(f"[失败] 处理 {file_path} 时出错: {e}")

def batch_convert():
    current_dir = os.getcwd()
    md_files = [f for f in os.listdir(current_dir) if f.endswith('.md')]
    
    if not md_files:
        print("当前目录下没有找到 .md 文件。")
        return
        
    print(f"发现 {len(md_files)} 个 Markdown 文件，开始转换...\n")
    for md_file in md_files:
        convert_hugo_to_vitepress(os.path.join(current_dir, md_file))
        
    print("\n转换完成！")

if __name__ == "__main__":
    batch_convert()